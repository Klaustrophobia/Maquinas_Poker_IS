import { NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { AuthController } from "@/controllers/AuthController";

export async function POST(req: Request) {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const { correo, codigo } = await req.json();

    const controller = new AuthController();
    const result = await controller.verify(correo, codigo);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
