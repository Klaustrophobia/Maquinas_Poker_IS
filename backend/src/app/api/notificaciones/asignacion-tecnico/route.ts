import { NextRequest, NextResponse } from "next/server";
import { NotificacionService } from "@/services/Notificacion.service";
import { AppDataSource } from "@/lib/db";

const notificacionService = new NotificacionService();

export async function POST(request: NextRequest) {
  try {
    const { 
      tecnico_id, 
      solicitud_id, 
      fecha_hora_reparacion, 
      cliente_nombre, 
      maquina_nombre,
      descripcion_falla 
    } = await request.json();

    // Validar campos requeridos
    if (!tecnico_id || !solicitud_id || !fecha_hora_reparacion) {
      return NextResponse.json({
        success: false,
        message: "Faltan campos requeridos: tecnico_id, solicitud_id, fecha_hora_reparacion"
      }, { status: 400 });
    }

    // Crear notificación para el técnico
    const notificacion = await notificacionService.crearNotificacion({
      usuario_id: tecnico_id,
      titulo: "Nueva Asignación de Reparación",
      mensaje: `Se te ha asignado una nueva reparación para la máquina "${maquina_nombre}" del cliente ${cliente_nombre}. Fecha programada: ${new Date(fecha_hora_reparacion).toLocaleDateString('es-ES')}`,
      tipo: "asignacion_tecnico",
      relacion_id: solicitud_id,
      enviar_email: true
    });

    if (!notificacion) {
      throw new Error("Error al crear la notificación para el técnico");
    }

    return NextResponse.json({
      success: true,
      message: "Notificación enviada al técnico exitosamente",
      data: {
        notificacion_id: notificacion.id,
        tecnico_id,
        solicitud_id
      }
    });

  } catch (error) {
    console.error("Error en notificar técnico:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor al notificar al técnico"
    }, { status: 500 });
  }
}