import { NextRequest, NextResponse } from "next/server";
import { RepuestoService } from "@/services/Repuestos.service";

const repuestoService = new RepuestoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    if (search) {
      const repuestos = await repuestoService.searchRepuestosByName(search);
      return NextResponse.json(repuestos);
    } else {
      const repuestos = await repuestoService.getAllRepuestos();
      return NextResponse.json(repuestos);
    }
  } catch (error) {
    console.error("Error en GET /api/repuestos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, proveedor_id, cantidad, ubicacion, estado } = body;

    if (!nombre || !proveedor_id || !cantidad || !estado) {
      return NextResponse.json(
        { error: "Nombre, proveedor_id, cantidad y estado son requeridos" },
        { status: 400 }
      );
    }

    const repuesto = await repuestoService.createRepuesto({
      nombre,
      proveedor_id: parseInt(proveedor_id),
      cantidad: parseInt(cantidad),
      ubicacion,
      estado
    });

    return NextResponse.json(repuesto, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/repuestos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}