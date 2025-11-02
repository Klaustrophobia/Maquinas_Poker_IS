import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { correo, codigo_login } = body;

  if (!correo || !codigo_login)
    return NextResponse.json({ error: "Correo y código son requeridos" }, { status: 400 });

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Usuario);
  const user = await userRepo.findOne({ where: { correo } });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  if (user.codigo_login !== codigo_login)
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });

  // Limpiar el código luego de usarlo
  user.codigo_login = null;
  await userRepo.save(user);

  return NextResponse.json({
    message: "Login exitoso",
    usuario: {
      id: user.id,
      nombre_usuario: user.nombre_usuario,
      rol: user.rol,
      correo: user.correo,
      identificador_unico: user.identificador_unico,
    },
  });
}
