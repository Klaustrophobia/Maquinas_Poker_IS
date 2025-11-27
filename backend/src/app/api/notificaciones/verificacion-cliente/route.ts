import { NextRequest, NextResponse } from "next/server";
import { NotificacionService } from "@/services/Notificacion.service";
import { AppDataSource } from "@/lib/db";

const notificacionService = new NotificacionService();

export async function POST(request: NextRequest) {
  try {
    const { 
      cliente_id, 
      solicitud_id, 
      maquina_nombre,
      tecnico_nombre,
      observaciones 
    } = await request.json();

    console.log("📨 Datos recibidos para notificar cliente:", {
      cliente_id, 
      solicitud_id, 
      maquina_nombre,
      tecnico_nombre,
      observaciones 
    });

    // Validar campos requeridos
    if (!cliente_id || !solicitud_id) {
      return NextResponse.json({
        success: false,
        message: "Faltan campos requeridos: cliente_id, solicitud_id"
      }, { status: 400 });
    }

    // Crear notificación para el cliente
    const notificacion = await notificacionService.crearNotificacion({
      usuario_id: cliente_id,
      titulo: "Reparación Completada - Verificación Requerida",
      mensaje: `La reparación de su máquina "${maquina_nombre}" ha sido completada por el técnico ${tecnico_nombre}. Por favor verifique el funcionamiento y confirme la finalización.${observaciones ? ` Observaciones: ${observaciones}` : ''}`,
      tipo: "verificacion_cliente",
      relacion_id: solicitud_id,
      enviar_email: true
    });

    if (!notificacion) {
      throw new Error("Error al crear la notificación para el cliente");
    }

    return NextResponse.json({
      success: true,
      message: "Notificación enviada al cliente exitosamente",
      data: {
        notificacion_id: notificacion.id,
        cliente_id,
        solicitud_id
      }
    });

  } catch (error) {
    console.error("Error en notificar cliente:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor al notificar al cliente",
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}