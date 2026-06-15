const supabase = require('../../config/supabase');   // Ajusta la ruta según tu estructura
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {enviarEmailVerificacion, enviarEmailReset} = require('../../config/email');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password son requeridos' });
        }

        const { data: user, error } = await supabase
            .from('usuarios')
            .select(`
                id,
                nombre,
                email,
                password,
                activo,
                email_verificado,
                roles!usuarios_rol_id_fkey (nombre)
            `)
            .eq('email', email)
            .eq('activo', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
        }

        // verificar correo
        if (!user.email_verificado){
            return res.status(401).json({
                message: 'Debes verificar tu correo electrónico antes de iniciar sesión',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                rol: user.roles.nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                rol: user.roles.nombre
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.registro = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Verificar si el email ya existe
        const { data: existe } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existe) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Obtener ID del rol "maestro"
        const { data: rolData, error: rolError } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'maestro')
            .single();

        if (rolError || !rolData) {
            return res.status(500).json({ message: 'Rol "maestro" no encontrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Token de verificación de 24h
        const verificacionToken = crypto.randomBytes(32).toString('hex');
        const verificacionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Crear nuevo usuario
        const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert({
                nombre,
                email,
                password: passwordHash,
                rol_id: rolData.id,
                activo: true,
                email_verificado: false,
                verificacion_token: verificacionToken,
                verificacion_expires: verificacionExpires.toISOString()
            })
            .select('id, nombre, email')
            .single();

        if (insertError) {
            console.error(insertError);
            return res.status(500).json({ message: 'Error al crear la cuenta' });
        }

        //Enviar email de verificacion
        await enviarEmailVerificacion(email, nombre, verificacionToken);

        res.status(201).json({
            success: true,
            message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta',
            usuario: newUser
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.verificarEmail = async(req, res) =>{
    try{
        const { token } = req.params;

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('id, verificacion_expires')
            .eq('verificacion_token', token)
            .eq('email_verificado', false)
            .maybeSingle();
        
        if (error || !user){
            return res.status(400).json({message: 'Token inválido o ya utilizado'});
        }

        if (new Date()> new Date(user.verificacion_expires)){
            return res.status(400).json({message: 'El token ha expirado. Solicita un nuevo correo de verificación'});
        }

        await supabase
            .from('usuarios')
            .update({
                email_verificado: true,
                verificacion_token: null,
                verificacion_expires: null
            })
            .eq('id', user.id);
        
        res.json({success:true, message: 'Correo verificado correctamente. Ya puedes inciar sesión.'});
    }catch (error){
        console.error(error);
        res.status(500).json({message:'Error verificando email'});
    }
};

exports.solicitarReset = async (req, res) => {
    try {
        const { email } = req.body;

        const { data: user } = await supabase
            .from('usuarios')
            .select('id, nombre')
            .eq('email', email)
            .maybeSingle();

        // Siempre responder igual por seguridad (no revelar si el email existe)
        if (!user) {
            return res.json({ message: 'Si el correo existe, recibirás un enlace en breve.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Eliminar tokens anteriores del usuario
        await supabase
            .from('password_reset_tokens')
            .delete()
            .eq('usuario_id', user.id);

        // Insertar nuevo token
        await supabase
            .from('password_reset_tokens')
            .insert({
                usuario_id: user.id,
                token,
                expires_at: expiresAt.toISOString()
            });

        await enviarEmailReset(email, user.nombre, token);

        res.json({ message: 'Si el correo existe, recibirás un enlace en breve.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error procesando la solicitud' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password || password.length < 6) {
            return res.status(400).json({ message: 'Token y contraseña son requeridos' });
        }

        const { data: resetToken, error } = await supabase
            .from('password_reset_tokens')
            .select('usuario_id, expires_at, used')
            .eq('token', token)
            .maybeSingle();

        if (error || !resetToken) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        if (resetToken.used) {
            return res.status(400).json({ message: 'Este enlace ya fue utilizado' });
        }

        if (new Date() > new Date(resetToken.expires_at)) {
            return res.status(400).json({ message: 'El enlace ha expirado. Solicita uno nuevo.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await supabase
            .from('usuarios')
            .update({ password: passwordHash })
            .eq('id', resetToken.usuario_id);

        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('token', token);

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error actualizando contraseña' });
    }
};

exports.reenviarVerificacion = async (req, res) => {
    try {
        const { email } = req.body;

        const { data: user } = await supabase
            .from('usuarios')
            .select('id, nombre, email_verificado')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            return res.json({ message: 'Si el correo existe, recibirás un nuevo enlace.' });
        }

        if (user.email_verificado) {
            return res.status(400).json({ message: 'Este correo ya está verificado' });
        }

        const verificacionToken = crypto.randomBytes(32).toString('hex');
        const verificacionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await supabase
            .from('usuarios')
            .update({
                verificacion_token: verificacionToken,
                verificacion_expires: verificacionExpires.toISOString()
            })
            .eq('id', user.id);

        await enviarEmailVerificacion(email, user.nombre, verificacionToken);
        res.json({ message: 'Nuevo enlace de verificación enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error reenviando verificación' });
    }
};