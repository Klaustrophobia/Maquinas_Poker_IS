import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { sendVerificationEmail } from "@/lib/mailer";
import { applyCorsHeaders } from "@/lib/cors";

function generateCode(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { correo, contraseña } = body;

  if (!correo || !contraseña) {
    return NextResponse.json({ error: "Correo y contraseña son requeridos" }, { status: 400 });
  }

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Usuario);
  const user = await userRepo.findOne({ where: { correo } });

  if (!user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  if (!user.activo) {
    return NextResponse.json({ error: "Cuenta desactivada" }, { status: 401 });
  }

  // ✅ COMPARACIÓN DIRECTA (sin bcrypt)
  if (user.contraseña !== contraseña) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  // ✅ Generar y guardar código
  const code = generateCode();
  user.codigo_login = code;
  await userRepo.save(user);

  // ✅ Enviar correo
  await sendVerificationEmail(user.correo, code);

  return applyCorsHeaders(req, NextResponse.json({ message: "Código de login enviado por correo" }), "POST,OPTIONS");
}

export async function OPTIONS(req: NextRequest) {
  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }), "POST,OPTIONS");
}