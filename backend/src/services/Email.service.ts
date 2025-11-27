// services/Email.service.ts
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Usa contraseña de aplicación
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a: ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  // Plantillas de email para diferentes tipos de notificaciones
  getEmailTemplate(titulo: string, mensaje: string, tipo: string): string {
    const colors: { [key: string]: string } = {
      solicitud_creada: '#3498db',
      nueva_solicitud: '#e74c3c',
      tecnico_asignado: '#f39c12',
      orden_trabajo: '#9b59b6',
      reparacion_completada: '#27ae60',
      reparacion_finalizada: '#2ecc71',
      default: '#3498db'
    };

    const color = colors[tipo] || colors.default;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sistema de Gestión de Reparaciones</h1>
          </div>
          <div class="content">
            <h2>${titulo}</h2>
            <p>${mensaje}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Método para verificar la conexión
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Conexión con el servidor de email establecida correctamente');
      return true;
    } catch (error) {
      console.error('Error verificando conexión de email:', error);
      return false;
    }
  }
}