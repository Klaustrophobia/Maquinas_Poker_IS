// services/Notificacion.service.ts
import { NotificacionRepository } from "@/repositories/Notificacion.repository";
import { EmailService } from "@/services/Email.service";
import { Notificacion } from "@/entities/Notificacion";
import { CrearNotificacionDTO, NotificacionResponseDTO } from "@/dtos/NotificacionDTO";

export class NotificacionService {
  private notificacionRepository: NotificacionRepository;
  private emailService: EmailService;

  constructor() {
    this.notificacionRepository = new NotificacionRepository();
    this.emailService = new EmailService();
  }

  async crearNotificacion(dto: CrearNotificacionDTO): Promise<Notificacion> {
    try {
      const notificacion = await this.notificacionRepository.crearNotificacion(dto);
      
      // Enviar email si está habilitado
      if (dto.enviar_email !== false) { // Por defecto envía email
        await this.enviarNotificacionPorEmail(notificacion);
      }
      
      return notificacion;
    } catch (error) {
      console.error('Error en NotificacionService.crearNotificacion:', error);
      throw new Error(`Error al crear notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async crearNotificacionMultiple(
    usuariosIds: number[], 
    titulo: string, 
    mensaje: string, 
    tipo: string, 
    relacion_id?: number
  ): Promise<Notificacion[]> {
    try {
      const notificaciones: Notificacion[] = [];
      
      for (const usuarioId of usuariosIds) {
        const notificacion = await this.crearNotificacion({
          usuario_id: usuarioId,
          titulo,
          mensaje,
          tipo,
          relacion_id,
          enviar_email: true
        });
        notificaciones.push(notificacion);
      }
      
      return notificaciones;
    } catch (error) {
      console.error('Error en NotificacionService.crearNotificacionMultiple:', error);
      throw new Error(`Error al crear notificaciones múltiples: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async notificarAdministradores(titulo: string, mensaje: string, tipo: string, relacion_id?: number): Promise<Notificacion[]> {
    try {
      const administradores = await this.notificacionRepository.obtenerNotificacionesAdministradores();
      const adminIds = administradores.map(admin => admin.id);
      
      return await this.crearNotificacionMultiple(adminIds, titulo, mensaje, tipo, relacion_id);
    } catch (error) {
      console.error('Error en NotificacionService.notificarAdministradores:', error);
      throw new Error(`Error al notificar administradores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async enviarNotificacionPorEmail(notificacion: Notificacion): Promise<void> {
    try {
      const usuario = await this.notificacionRepository.obtenerUsuarioPorId(notificacion.usuario.id);
      
      if (!usuario || !usuario.correo) {
        console.warn(`No se puede enviar email: usuario ${notificacion.usuario.id} no encontrado o sin email`);
        return;
      }

      const html = this.emailService.getEmailTemplate(
        notificacion.titulo,
        notificacion.mensaje,
        notificacion.tipo
      );

      await this.emailService.sendEmail({
        to: usuario.correo,
        subject: notificacion.titulo,
        html: html
      });
    } catch (error) {
      console.error('Error enviando notificación por email:', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }

  async obtenerNotificacionesPorUsuario(usuarioId: number, noLeidas?: boolean): Promise<NotificacionResponseDTO[]> {
    try {
      const notificaciones = await this.notificacionRepository.obtenerNotificacionesPorUsuario(usuarioId, noLeidas);
      
      return notificaciones.map(notif => ({
        id: notif.id,
        titulo: notif.titulo,
        mensaje: notif.mensaje,
        tipo: notif.tipo,
        leida: notif.leida,
        fecha_creacion: notif.fecha_creacion.toISOString(),
        relacion_id: notif.relacion_id,
        usuario: {
          id: notif.usuario.id,
          nombre_usuario: notif.usuario.nombre_usuario,
          correo: notif.usuario.correo // Incluir email en la respuesta
        }
      }));
    } catch (error) {
      console.error('Error en NotificacionService.obtenerNotificacionesPorUsuario:', error);
      throw new Error(`Error al obtener notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async marcarComoLeida(notificacionId: number): Promise<Notificacion> {
    try {
      return await this.notificacionRepository.marcarComoLeida(notificacionId);
    } catch (error) {
      console.error('Error en NotificacionService.marcarComoLeida:', error);
      throw new Error(`Error al marcar notificación como leída: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async marcarTodasComoLeidas(usuarioId: number): Promise<void> {
    try {
      await this.notificacionRepository.marcarTodasComoLeidas(usuarioId);
    } catch (error) {
      console.error('Error en NotificacionService.marcarTodasComoLeidas:', error);
      throw new Error(`Error al marcar notificaciones como leídas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
    try {
      return await this.notificacionRepository.contarNotificacionesNoLeidas(usuarioId);
    } catch (error) {
      console.error('Error en NotificacionService.contarNotificacionesNoLeidas:', error);
      throw new Error(`Error al contar notificaciones no leídas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}