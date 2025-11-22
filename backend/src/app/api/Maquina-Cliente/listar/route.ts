import { NextRequest, NextResponse } from "next/server";
import { MaquinaClienteController } from "@/controllers/MaquinaCliente.controller";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const clienteId = url.searchParams.get("cliente_id");

    if (!clienteId) {
      return NextResponse.json(
        { error: "cliente_id es requerido como query param" },
        { status: 400 }
      );
    }

    // Cambiado de listarPorCliente a listar
    const resultado = await MaquinaClienteController.listar(Number(clienteId));
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: unknown) {
    console.error("Error en listar máquinas:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
