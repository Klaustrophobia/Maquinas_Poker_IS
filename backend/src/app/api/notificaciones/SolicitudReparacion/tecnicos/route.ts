import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

// GET /api/SolicitudReparacion/tecnicos - Obtener técnicos activos
export async function GET(request: NextRequest) {
  try {
    const response = await controller.obtenerTecnicosActivos();
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en GET /api/SolicitudReparacion/tecnicos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}