import { NextRequest, NextResponse } from "next/server";
import { NotificacionService } from "@/services/Notificacion.service";
import { AppDataSource } from "@/lib/db";

const notificacionService = new NotificacionService();

export async function POST(request: NextRequest) {
  try {
    const { 
      solicitud_id, 
      cliente_nombre, 
      maquina_nombre,
      tecnico_nombre 
    } = await request.json();

    // Validar campos requeridos
    if (!solicitud_id || !cliente_nombre || !maquina_nombre) {
      return NextResponse.json({
        success: false,
        message: "Faltan campos requeridos: solicitud_id, cliente_nombre, maquina_nombre"
      }, { status: 400 });
    }

    // Obtener todos los administradores y superadministradores
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

    let notificacionesEnviadas = 0;
    let emailsEnviados = 0;

    // Crear notificación para cada administrador
    for (const admin of administradores) {
      try {
        const notificacion = await notificacionService.crearNotificacion({
          usuario_id: admin.id,
          titulo: "Reparación Finalizada y Verificada",
          mensaje: `El cliente ${cliente_nombre} ha verificado y finalizado la reparación de la máquina "${maquina_nombre}".${tecnico_nombre ? ` Técnico asignado: ${tecnico_nombre}` : ''}`,
          tipo: "reparacion_finalizada",
          relacion_id: solicitud_id,
          enviar_email: true
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
    console.error("Error en notificar reparación finalizada:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}