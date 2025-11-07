import { NextRequest, NextResponse } from "next/server";
import { RepuestoService } from "@/services/Repuestos.service";

const repuestoService = new RepuestoService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID debe ser un número válido" },
        { status: 400 }
      );
    }

    const repuesto = await repuestoService.getRepuestoById(numericId);

    if (!repuesto) {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(repuesto);
  } catch (error) {
    console.error("Error en GET /api/repuestos/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID debe ser un número válido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, cantidad, ubicacion, estado, proveedor_id } = body;

    const repuestoExistente = await repuestoService.getRepuestoById(numericId);
    if (!repuestoExistente) {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    const repuestoActualizado = await repuestoService.updateRepuesto(numericId, {
      nombre,
      cantidad: cantidad ? parseInt(cantidad) : undefined,
      ubicacion,
      estado,
      proveedor_id: proveedor_id ? parseInt(proveedor_id) : undefined
    });

    return NextResponse.json(repuestoActualizado);
  } catch (error) {
    console.error("Error en PUT /api/repuestos/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID debe ser un número válido" },
        { status: 400 }
      );
    }

    const repuestoExistente = await repuestoService.getRepuestoById(numericId);
    if (!repuestoExistente) {
      return NextResponse.json(
        { error: "Repuesto no encontrado" },
        { status: 404 }
      );
    }

    const deleted = await repuestoService.deleteRepuesto(numericId);
    return NextResponse.json({ 
      success: deleted,
      message: "Repuesto eliminado correctamente" 
    });
  } catch (error) {
    console.error("Error en DELETE /api/repuestos/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}