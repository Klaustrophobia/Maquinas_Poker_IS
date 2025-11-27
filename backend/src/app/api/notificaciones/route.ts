import { NextRequest, NextResponse } from "next/server";
import { NotificacionController } from "@/controllers/Notificacion.controller";
import { initializeDatabase } from "@/lib/db";

// Inicializar la base de datos si no está inicializada
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

const controller = new NotificacionController();

// GET /api/notificaciones - Obtener mis notificaciones (usuario autenticado)
export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const { searchParams } = new URL(request.url);
    const noLeidas = searchParams.get('noLeidas');
    
    // Simulación de usuario autenticado (en producción usarías un token JWT)
    const userIdHeader = request.headers.get('x-user-id');
    
    if (!userIdHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no autenticado"
        },
        { status: 401 }
      );
    }

    const response = await controller.obtenerMisNotificaciones(userIdHeader, noLeidas || undefined);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en GET /api/notificaciones:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// POST /api/notificaciones - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const response = await controller.crearNotificacion(request);
    
    return NextResponse.json(response, { 
      status: response.success ? 201 : 400 
    });
  } catch (error) {
    console.error("Error en POST /api/notificaciones:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// PUT /api/notificaciones - Marcar todas mis notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    
    if (!userIdHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no autenticado"
        },
        { status: 401 }
      );
    }

    const response = await controller.marcarTodasComoLeidas(userIdHeader);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error("Error en PUT /api/notificaciones:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}