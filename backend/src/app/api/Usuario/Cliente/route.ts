import { NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";

export async function GET() {
  try {
    const db = await AppDataSource.initialize().catch(() => AppDataSource);
    const usuarioRepo = db.getRepository(Usuario);

    // Traer solo usuarios con rol 'cliente'
    const clientes = await usuarioRepo.find({
      where: { rol: "Cliente" },
    });

    return NextResponse.json(clientes, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
