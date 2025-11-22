import { NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { MaquinaCliente } from "@/entities/MaquinaCliente";

export async function GET() {
  try {
    const db = await AppDataSource.initialize().catch(() => AppDataSource);
    const repo = db.getRepository(MaquinaCliente);

    // Traer todas las máquinas con su cliente si tiene
    const maquinas = await repo.find({
      relations: ["maquina", "cliente"],
    });

    return NextResponse.json(maquinas);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
