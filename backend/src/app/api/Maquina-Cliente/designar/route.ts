import { NextRequest, NextResponse } from "next/server";
import { MaquinaClienteController } from "@/controllers/MaquinaCliente.controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Body recibido para designar:", body);

    if (!body.maquina_id) {
      return NextResponse.json(
        { error: "maquina_id es requerido" },
        { status: 400 }
      );
    }

    const resultado = await MaquinaClienteController.desasignar(body.maquina_id);
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Error en designar máquina:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
