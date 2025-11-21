import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { AuthController } from "@/controllers/AuthController";
import { applyCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }), "POST,OPTIONS");
}

export async function POST(req: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    
    const body = await req.json();
    const { correo, codigo } = body;

    if (!correo || !codigo) {
      return applyCorsHeaders(
        req,
        NextResponse.json({ error: "Correo y código son requeridos" }, { status: 400 }),
        "POST,OPTIONS"
      );
    }

    const controller = new AuthController();
    const result = await controller.verify(correo, codigo);

    return applyCorsHeaders(req, NextResponse.json(result), "POST,OPTIONS");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar la verificación";
    return applyCorsHeaders(
      req,
      NextResponse.json({ error: message }, { status: 400 }),
      "POST,OPTIONS"
    );
  }
}