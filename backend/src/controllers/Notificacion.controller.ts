// controllers/Notificacion.controller.ts
import { NextRequest } from "next/server";
import { NotificacionService } from "@/services/Notificacion.service";
import { CrearNotificacionDTO } from "@/dtos/NotificacionDTO";

export class NotificacionController {
  private notificacionService: NotificacionService;

  constructor() {
    this.notificacionService = new NotificacionService();
  }

  // Crear nueva notificación
  crearNotificacion = async (req: NextRequest) => {
    try {
      const dto: CrearNotificacionDTO = await req.json();
      
      const notificacion = await this.notificacionService.crearNotificacion(dto);
      
      return {
        success: true,
        data: notificacion,
        message: "Notificación creada exitosamente"
      };
    } catch (error) {
      console.error("Error en crearNotificacion:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al crear notificación"
      };
    }
  };

  // Crear notificación múltiple
  crearNotificacionMultiple = async (req: NextRequest) => {
    try {
      const { usuarios_ids, titulo, mensaje, tipo, relacion_id } = await req.json();
      
      if (!usuarios_ids || !Array.isArray(usuarios_ids)) {
        return {
          success: false,
          message: "Lista de usuarios inválida"
        };
      }

      const notificaciones = await this.notificacionService.crearNotificacionMultiple(
        usuarios_ids,
        titulo,
        mensaje,
        tipo,
        relacion_id
      );
      
      return {
        success: true,
        data: notificaciones,
        message: "Notificaciones creadas exitosamente"
      };
    } catch (error) {
      console.error("Error en crearNotificacionMultiple:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al crear notificaciones"
      };
    }
  };

  // Notificar administradores
  notificarAdministradores = async (req: NextRequest) => {
    try {
      const { titulo, mensaje, tipo, relacion_id } = await req.json();
      
      const notificaciones = await this.notificacionService.notificarAdministradores(
        titulo,
        mensaje,
        tipo,
        relacion_id
      );
      
      return {
        success: true,
        data: notificaciones,
        message: "Administradores notificados exitosamente"
      };
    } catch (error) {
      console.error("Error en notificarAdministradores:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al notificar administradores"
      };
    }
  };

  // Obtener notificaciones por usuario
  obtenerNotificacionesPorUsuario = async (usuarioId: string, noLeidas?: string) => {
    try {
      const usuarioIdNum = parseInt(usuarioId);
      
      if (isNaN(usuarioIdNum)) {
        return {
          success: false,
          message: "ID de usuario inválido"
        };
      }

      const soloNoLeidas = noLeidas === 'true';
      const notificaciones = await this.notificacionService.obtenerNotificacionesPorUsuario(usuarioIdNum, soloNoLeidas);
      
      return {
        success: true,
        data: notificaciones,
        count: notificaciones.length
      };
    } catch (error) {
      console.error("Error en obtenerNotificacionesPorUsuario:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener notificaciones"
      };
    }
  };

  // Marcar notificación como leída
  marcarComoLeida = async (notificacionId: string) => {
    try {
      const id = parseInt(notificacionId);
      
      if (isNaN(id)) {
        return {
          success: false,
          message: "ID de notificación inválido"
        };
      }

      const notificacion = await this.notificacionService.marcarComoLeida(id);
      
      return {
        success: true,
        data: notificacion,
        message: "Notificación marcada como leída"
      };
    } catch (error) {
      console.error("Error en marcarComoLeida:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al marcar notificación como leída"
      };
    }
  };

  // Marcar todas como leídas
  marcarTodasComoLeidas = async (usuarioId: string) => {
    try {
      const usuarioIdNum = parseInt(usuarioId);
      
      if (isNaN(usuarioIdNum)) {
        return {
          success: false,
          message: "ID de usuario inválido"
        };
      }

      await this.notificacionService.marcarTodasComoLeidas(usuarioIdNum);
      
      return {
        success: true,
        message: "Todas las notificaciones marcadas como leídas"
      };
    } catch (error) {
      console.error("Error en marcarTodasComoLeidas:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al marcar notificaciones como leídas"
      };
    }
  };

  // Obtener conteo de notificaciones no leídas
  contarNotificacionesNoLeidas = async (usuarioId: string) => {
    try {
      const usuarioIdNum = parseInt(usuarioId);
      
      if (isNaN(usuarioIdNum)) {
        return {
          success: false,
          message: "ID de usuario inválido"
        };
      }

      const count = await this.notificacionService.contarNotificacionesNoLeidas(usuarioIdNum);
      
      return {
        success: true,
        data: { count },
        message: "Conteo obtenido exitosamente"
      };
    } catch (error) {
      console.error("Error en contarNotificacionesNoLeidas:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al contar notificaciones"
      };
    }
  };

  // Obtener mis notificaciones (usuario autenticado)
  obtenerMisNotificaciones = async (userId: string, noLeidas?: string) => {
    try {
      const usuarioIdNum = parseInt(userId);
      
      if (isNaN(usuarioIdNum)) {
        return {
          success: false,
          message: "ID de usuario inválido"
        };
      }

      const soloNoLeidas = noLeidas === 'true';
      const notificaciones = await this.notificacionService.obtenerNotificacionesPorUsuario(usuarioIdNum, soloNoLeidas);
      
      return {
        success: true,
        data: notificaciones,
        count: notificaciones.length
      };
    } catch (error) {
      console.error("Error en obtenerMisNotificaciones:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener notificaciones"
      };
    }
  };
}