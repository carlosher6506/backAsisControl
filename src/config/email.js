const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarEmailVerificacion = async (email, nombre, token) => {
    const url = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'AsisControl <onboarding@resend.dev>',
            to: email,
            subject: 'Verifica tu correo electrónico - AsisControl',
            html: `
                <div style="background:#f4f6f9;padding:40px 20px;font-family:Arial,sans-serif;">
                    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:35px;">
                        <h1>AsisControl</h1>

                        <h2>¡Bienvenido, ${nombre}!</h2>

                        <p>
                            Gracias por registrarte en AsisControl.
                        </p>

                        <a href="${url}"
                            style="
                                background:#2563eb;
                                color:white;
                                padding:14px 28px;
                                text-decoration:none;
                                border-radius:8px;
                                display:inline-block;
                            ">
                            Verificar mi cuenta
                        </a>

                        <p style="margin-top:20px;">
                            ${url}
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error(error);
            throw error;
        }

        console.log('Correo verificación enviado');
        return data;

    } catch (error) {
        console.error('Error enviando verificación:', error);
        throw error;
    }
};

const enviarEmailReset = async (email, nombre, token) => {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {

        const { data, error } = await resend.emails.send({
            from: 'AsisControl <onboarding@resend.dev>',
            to: email,
            subject: 'Restablecer contraseña - AsisControl',
            html: `
                <div style="font-family:Arial,sans-serif;padding:20px;">
                    <h2>Restablecer contraseña</h2>

                    <p>
                        Hola ${nombre},
                    </p>

                    <p>
                        Recibimos una solicitud para restablecer tu contraseña.
                    </p>

                    <a href="${url}">
                        Restablecer contraseña
                    </a>

                    <p>
                        Este enlace expira en 1 hora.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error(error);
            throw error;
        }

        console.log('Correo reset enviado');
        return data;

    } catch (error) {
        console.error('Error enviando reset:', error);
        throw error;
    }
};

module.exports = {
    enviarEmailReset,
    enviarEmailVerificacion
};