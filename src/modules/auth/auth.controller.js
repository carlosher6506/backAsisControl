const supabase = require('../../config/supabase');   // Ajusta la ruta según tu estructura
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password son requeridos' });
        }

        // Versión corregida con hint de relación
        const { data: user, error } = await supabase
            .from('usuarios')
            .select(`
                id,
                nombre,
                email,
                password,
                activo,
                roles!usuarios_rol_id_fkey (nombre)
            `)
            .eq('email', email)
            .eq('activo', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
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
            .single();

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

        // Crear nuevo usuario
        const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert({
                nombre,
                email,
                password: passwordHash,
                rol_id: rolData.id,
                activo: true
            })
            .select('id, nombre, email')
            .single();

        if (insertError) {
            console.error(insertError);
            return res.status(500).json({ message: 'Error al crear la cuenta' });
        }

        res.status(201).json({
            success: true,
            message: 'Cuenta creada correctamente',
            usuario: newUser
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};