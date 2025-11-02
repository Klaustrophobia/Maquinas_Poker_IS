import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { sendVerificationEmail } from "@/lib/mailer";

function generateCode(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Responder preflight
export async function OPTIONS() {
  return withCORS(NextResponse.json({})); // responde 200 con headers
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { correo } = body;

  if (!correo) return withCORS(NextResponse.json({ error: "Correo es requerido" }, { status: 400 }));

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Usuario);
  const user = await userRepo.findOne({ where: { correo } });

  if (!user) return withCORS(NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }));

  const code = generateCode();
  user.codigo_login = code;
  await userRepo.save(user);

  await sendVerificationEmail(user.correo, code);

  return withCORS(NextResponse.json({ message: "Código de login enviado por correo" }));
}
