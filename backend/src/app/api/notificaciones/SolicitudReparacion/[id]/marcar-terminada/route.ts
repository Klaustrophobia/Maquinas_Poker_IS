import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await controller.marcarReparacionTerminada(id, request);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en PUT /api/SolicitudReparacion/[id]/marcar-terminada:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}