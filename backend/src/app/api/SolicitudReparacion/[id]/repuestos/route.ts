import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await controller.agregarRepuestoUtilizado(id, request);
    
    return NextResponse.json(response, { 
      status: response.success ? 201 : 400 
    });
  } catch (error) {
    console.error("Error en POST /api/SolicitudReparacion/[id]/repuestos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// Agregar método GET para obtener repuestos utilizados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await controller.obtenerRepuestosUtilizados(id);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error("Error en GET /api/SolicitudReparacion/[id]/repuestos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}