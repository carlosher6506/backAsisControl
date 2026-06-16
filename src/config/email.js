const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP ERROR:", error);
    } else {
        console.log("SMTP OK");
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

        const info = await transporter.sendMail({
            from: `"AsisControl" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Restablecer contraseña - AsisControl',
            html:`
                <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                    <h2 style="color:#111;">Restablecer contraseña</h2>
                    <p>Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer tu contraseña.</p>
                    <a href="${url}"
                        style="display:inline-block;background:#111;color:#fff;padding:12px 24px;
                        border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
                        Restablecer contraseña
                    </a>
                    <p style="color:#666;font-size:13px;">
                        Este enlace expira en <strong>1 hora</strong>.<br/>
                        Si no solicitaste esto, ignora este correo.
                    </p>
                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
                    <p style="color:#999;font-size:12px;">© 2026 AsisControl — Gohe-Dev</p>
                </div>
            `
        });
        console.log('Correo reset enviado', info);
    }catch(error){
        console.error('Error enviando reset', error);
        throw error
    }
    
};

module.exports = {enviarEmailReset, enviarEmailVerificacion};