// src/app/api/Maquina-Cliente/reasignar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MaquinaClienteController } from "@/controllers/MaquinaCliente.controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Body recibido para reasignar:", body);

    if (!body.maquina_id || !body.nuevo_cliente_id) {
      return NextResponse.json(
        { error: "maquina_id y nuevo_cliente_id son requeridos" },
        { status: 400 }
      );
    }

    const resultado = await MaquinaClienteController.reasignar(body);
    return NextResponse.json(resultado, { status: 200 });
    
  } catch (error: unknown) {
    console.error("Error en reasignar máquina:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}