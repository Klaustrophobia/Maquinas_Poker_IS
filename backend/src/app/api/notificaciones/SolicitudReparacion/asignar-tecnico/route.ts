import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

// PUT /api/SolicitudReparacion/asignar-tecnico - Asignar técnico a solicitud
export async function PUT(request: NextRequest) {
  try {
    const response = await controller.asignarTecnicoDesdeBody(request);
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en PUT /api/SolicitudReparacion/asignar-tecnico:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}