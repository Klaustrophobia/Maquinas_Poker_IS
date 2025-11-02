import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { sendVerificationEmail } from "@/lib/mailer";

function generateCode(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { correo } = body;

  if (!correo) return NextResponse.json({ error: "Correo es requerido" }, { status: 400 });

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Usuario);
  const user = await userRepo.findOne({ where: { correo } });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Generar código aleatorio
  const code = generateCode();
  user.codigo_login = code;

  await userRepo.save(user);

  // Enviar correo
  await sendVerificationEmail(user.correo, code);

  return NextResponse.json({ message: "Código de login enviado por correo" });
}
