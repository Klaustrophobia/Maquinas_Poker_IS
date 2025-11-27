import { NextRequest, NextResponse } from "next/server";
import { NotificacionController } from "@/controllers/Notificacion.controller";

const controller = new NotificacionController();

// PUT /api/notificaciones/[id] - Marcar notificación como leída
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await controller.marcarComoLeida(id);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en PUT /api/notificaciones/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}