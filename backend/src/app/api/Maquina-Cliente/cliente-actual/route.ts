// src/app/api/Maquina-Cliente/cliente-actual/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MaquinaClienteController } from "@/controllers/MaquinaCliente.controller";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const maquinaId = url.searchParams.get("maquina_id");

    if (!maquinaId) {
      return NextResponse.json(
        { error: "maquina_id es requerido como query param" },
        { status: 400 }
      );
    }

    const resultado = await MaquinaClienteController.obtenerClienteActual(Number(maquinaId));
    return NextResponse.json(resultado, { status: 200 });
    
  } catch (error: any) {
    console.error("Error en obtener cliente actual:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}