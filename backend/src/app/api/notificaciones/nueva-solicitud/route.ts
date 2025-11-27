import { NextRequest, NextResponse } from "next/server";
import { NotificacionService } from "@/services/Notificacion.service";
import { AppDataSource } from "@/lib/db";

const notificacionService = new NotificacionService();

export async function POST(request: NextRequest) {
  try {
    const { titulo, mensaje, solicitud_id, cliente_nombre, maquina_nombre } = await request.json();

    // Obtener todos los administradores y superadministradores (CORREGIDO)
    const administradores = await AppDataSource.query(`
      SELECT id, nombre_usuario, correo, rol 
      FROM usuarios 
      WHERE rol IN ('Administrador', 'SuperAdmin')
    `);

    if (administradores.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No se encontraron administradores para notificar"
      }, { status: 404 });
    }

    const adminIds = administradores.map((admin: any) => admin.id);
    let notificacionesEnviadas = 0;
    let emailsEnviados = 0;

    // Crear notificación para cada administrador
    for (const admin of administradores) {
      try {
        const notificacion = await notificacionService.crearNotificacion({
          usuario_id: admin.id,
          titulo: titulo || "Nueva Solicitud de Reparación",
          mensaje: mensaje || `El cliente ${cliente_nombre} ha creado una nueva solicitud para la máquina "${maquina_nombre}"`,
          tipo: "nueva_solicitud",
          relacion_id: solicitud_id,
          enviar_email: true // Forzar envío de email
        });

        notificacionesEnviadas++;
        
        // El email se envía automáticamente por el servicio
        if (notificacion) {
          emailsEnviados++;
        }
      } catch (error) {
        console.error(`Error creando notificación para admin ${admin.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas a ${notificacionesEnviadas} administradores (${emailsEnviados} emails)`,
      data: {
        notificaciones_creadas: notificacionesEnviadas,
        emails_enviados: emailsEnviados,
        administradores_notificados: administradores.map((a: any) => ({
          id: a.id,
          nombre: a.nombre_usuario,
          correo: a.correo
        }))
      }
    });

  } catch (error) {
    console.error("Error en notificar administradores:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}