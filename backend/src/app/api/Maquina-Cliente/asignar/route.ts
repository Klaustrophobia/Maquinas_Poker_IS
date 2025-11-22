// src/app/api/Maquina-Cliente/asignar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MaquinaClienteController } from "@/controllers/MaquinaCliente.controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Body recibido:", body);

    if (!body.cliente_id || !body.maquina_id) {
      return NextResponse.json(
        { error: "cliente_id y maquina_id son requeridos" },
        { status: 400 }
      );
    }

    const resultado = await MaquinaClienteController.asignar(body);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: unknown) {
    console.error("Error en asignar máquina:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
