import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Envía un código de verificación simple al correo del usuario.
 * Usado tanto para registro como para inicio de sesión con código.
 */
export async function sendVerificationEmail(to: string, code: string) {
  const from = process.env.MAIL_FROM || `"Soporte Maquinas Poker" <${process.env.MAIL_USER}>`;

  const message = `
Hola,

Tu código de verificación es: ${code}

Por favor, ingrésalo en la aplicación para continuar con el proceso de inicio de sesión.
Este código es válido por 5 minutos.

Si no solicitaste este código, puedes ignorar este mensaje.

Atentamente,
El equipo de soporte del Equipo de Maquinas de Poker
  `;

  await mailer.sendMail({
    from,
    to,
    subject: "Código de verificación - Maquinas Poker - Inicio Session",
    text: message.trim(),
  });
}
