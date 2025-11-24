import { NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { EstadoMaquina, Maquina } from "@/entities/Maquina";
import { MaquinaCliente } from "@/entities/MaquinaCliente";
import { In, Not } from "typeorm";

export async function GET() {
  try {
    const db = await AppDataSource.initialize().catch(() => AppDataSource);

    const maquinaRepo = db.getRepository(Maquina);
    const asignacionRepo = db.getRepository(MaquinaCliente);

    const asignadas = await asignacionRepo.find({
      relations: ["maquina"],
    });

    const idsAsignadas = asignadas.map((a) => a.maquina.id);

    const maquinas =
      idsAsignadas.length > 0
        ? await maquinaRepo.find({
            where: {
              id: Not(In(idsAsignadas)),
              estado: EstadoMaquina.FUNCIONANDO,
            },
          })
        : await maquinaRepo.find({
            where: { estado: EstadoMaquina.FUNCIONANDO },
          });

    return NextResponse.json(maquinas);
  } catch (error: unknown) {
    console.error("Error:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
