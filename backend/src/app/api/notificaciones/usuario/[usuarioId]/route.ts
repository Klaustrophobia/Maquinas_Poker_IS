import { NextRequest, NextResponse } from "next/server";
import { NotificacionController } from "@/controllers/Notificacion.controller";

const controller = new NotificacionController();

// GET /api/notificaciones/usuario/[usuarioId] - Obtener notificaciones por usuario (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ usuarioId: string }> }
) {
  try {
    const { usuarioId } = await params;
    const { searchParams } = new URL(request.url);
    const noLeidas = searchParams.get('noLeidas');

    const response = await controller.obtenerNotificacionesPorUsuario(usuarioId, noLeidas || undefined);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en GET /api/notificaciones/usuario/[usuarioId]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// PUT /api/notificaciones/usuario/[usuarioId] - Marcar todas como leídas (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ usuarioId: string }> }
) {
  try {
    const { usuarioId } = await params;
    const response = await controller.marcarTodasComoLeidas(usuarioId);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en PUT /api/notificaciones/usuario/[usuarioId]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}