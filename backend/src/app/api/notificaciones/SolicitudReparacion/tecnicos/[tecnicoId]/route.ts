import { NextRequest, NextResponse } from "next/server";
import { SolicitudReparacionController } from "@/controllers/SolicitudReparacion.controller";

const controller = new SolicitudReparacionController();

// GET /api/SolicitudReparacion/tecnico/[tecnicoId] - Obtener solicitudes por técnico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tecnicoId: string }> }
) {
  try {
    const { tecnicoId } = await params;
    const tecnicoIdNum = parseInt(tecnicoId);
    
    if (isNaN(tecnicoIdNum)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de técnico inválido"
        },
        { status: 400 }
      );
    }

    // Usar el método existente con filtro de técnico
    const url = new URL(request.url);
    url.searchParams.set('tecnico_id', tecnicoIdNum.toString());
    
    const modifiedRequest = new NextRequest(url, {
      method: 'GET',
      headers: request.headers
    });

    const response = await controller.obtenerSolicitudes(modifiedRequest);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en GET /api/SolicitudReparacion/tecnico/[tecnicoId]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}