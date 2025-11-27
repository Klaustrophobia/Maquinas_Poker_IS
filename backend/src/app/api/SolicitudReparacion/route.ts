import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

// GET /api/SolicitudReparacion - Obtener todas las solicitudes
export async function GET(request: NextRequest) {
  try {
    const response = await controller.obtenerSolicitudes(request);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en GET /api/SolicitudReparacion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// POST /api/SolicitudReparacion - Crear nueva solicitud
export async function POST(request: NextRequest) {
  try {
    const response = await controller.crearSolicitud(request);
    
    return NextResponse.json(response, { 
      status: response.success ? 201 : 400 
    });
  } catch (error) {
    console.error("Error en POST /api/SolicitudReparacion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}