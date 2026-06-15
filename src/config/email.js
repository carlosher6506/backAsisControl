const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarEmailVerificacion = async (email, nombre, token) =>{
    const url = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    try{
        const info = await transporter.sendMail({
        from: `"AsisControl" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu correo electrónico - AsisControl',
        html: `
            <div style="background:#f4f6f9;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">

                <div style="background:#111827;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;">
                    AsisControl
                </h1>
                <p style="color:#d1d5db;margin-top:10px;">
                    Plataforma de gestión académica
                </p>
                </div>

                <div style="padding:35px;">
                <h2 style="color:#111827;">
                    ¡Bienvenido, ${nombre}!
                </h2>

                <p style="color:#4b5563;line-height:1.6;">
                    Gracias por registrarte en AsisControl.
                    Para activar tu cuenta y comenzar a utilizar la plataforma,
                    verifica tu dirección de correo electrónico.
                </p>

                <div style="text-align:center;margin:35px 0;">
                    <a href="${url}"
                    style="
                        background:#2563eb;
                        color:white;
                        padding:14px 28px;
                        border-radius:8px;
                        text-decoration:none;
                        font-weight:bold;
                        display:inline-block;
                    ">
                    Verificar mi cuenta
                    </a>
                </div>

                <p style="color:#4b5563;">
                    Si el botón anterior no funciona, copia y pega el siguiente enlace en tu navegador:
                </p>

                <p style="
                    word-break:break-all;
                    background:#f3f4f6;
                    padding:12px;
                    border-radius:6px;
                    color:#2563eb;
                    ">
                    ${url}
                </p>

                <p style="color:#6b7280;font-size:14px;">
                    Este enlace estará disponible durante las próximas
                    <strong>24 horas</strong>.
                </p>

                <p style="color:#6b7280;font-size:14px;">
                    Si no solicitaste esta cuenta, puedes ignorar este mensaje.
                </p>
                </div>

                <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">
                    © 2026 AsisControl · Gohe-Dev
                </p>
                </div>

                </div>
            </div>
        `
        });
    }catch (error){
        console.error('Error al enviar el correo', error);
    }
};

const enviarEmailReset = async (email, nombre, token) => {
    try{
        const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: `"AsisControl" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Restablecer contraseña - AsisControl',
            html: `
                <div style="background:#f4f6f9;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

                    <div style="background:#1e293b;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        AsisControl
                    </h1>
                    <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;">
                        Sistema de Control Escolar
                    </p>
                    </div>

                    <div style="padding:40px 35px;">

                    <h2 style="margin-top:0;color:#111827;">
                        Restablecimiento de contraseña
                    </h2>

                    <p style="color:#4b5563;line-height:1.7;">
                        Hola <strong>${nombre}</strong>,
                    </p>

                    <p style="color:#4b5563;line-height:1.7;">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de AsisControl.
                    </p>

                    <p style="color:#4b5563;line-height:1.7;">
                        Para crear una nueva contraseña, haz clic en el siguiente botón:
                    </p>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="${url}"
                        target="_blank"
                        style="
                            background:#2563eb;
                            color:#ffffff;
                            text-decoration:none;
                            padding:14px 30px;
                            border-radius:8px;
                            display:inline-block;
                            font-weight:bold;
                            font-size:15px;
                        ">
                        Restablecer contraseña
                        </a>
                    </div>

                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:15px;margin-top:20px;">
                        <p style="margin:0 0 10px 0;color:#374151;font-size:14px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                        </p>

                        <a href="${url}"
                        style="color:#2563eb;word-break:break-all;font-size:13px;">
                        ${url}
                        </a>
                    </div>

                    <div style="margin-top:30px;padding:15px;background:#fff7ed;border-left:4px solid #f59e0b;">
                        <p style="margin:0;color:#92400e;font-size:14px;">
                        ⏳ Este enlace expirará en <strong>1 hora</strong>.
                        </p>
                    </div>

                    <p style="margin-top:25px;color:#6b7280;font-size:14px;line-height:1.6;">
                        Si no solicitaste el restablecimiento de tu contraseña, puedes ignorar este correo de forma segura. Tu cuenta permanecerá protegida.
                    </p>

                    </div>

                    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                        © 2026 AsisControl · Gohe-Dev
                    </p>

                    <p style="margin-top:8px;color:#9ca3af;font-size:11px;">
                        Este es un correo automático. No respondas a este mensaje.
                    </p>
                    </div>

                </div>
                </div>
            `
        });
    }catch(error){
        console.error('Error enviando reset', enviarEmailReset);
        throw error;
    }
    
};

module.exports = {enviarEmailReset, enviarEmailVerificacion};