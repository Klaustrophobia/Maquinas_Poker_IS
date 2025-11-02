import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";

// --- Configuración CORS ---
const allowedOrigin = "http://localhost:3001";

function setCORSHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

// --- Manejo de preflight (OPTIONS) ---
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  return setCORSHeaders(res);
}

// --- Manejo del POST real ---
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { correo, codigo_login } = body;

  if (!correo || !codigo_login) {
    const res = NextResponse.json({ error: "Correo y código son requeridos" }, { status: 400 });
    return setCORSHeaders(res);
  }

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Usuario);
  const user = await userRepo.findOne({ where: { correo } });

  if (!user) {
    const res = NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return setCORSHeaders(res);
  }

  if (user.codigo_login !== codigo_login) {
    const res = NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
    return setCORSHeaders(res);
  }

  // Limpiar el código luego de usarlo
  user.codigo_login = null;
  await userRepo.save(user);

  const res = NextResponse.json({
    message: "Login exitoso",
    usuario: {
      id: user.id,
      nombre_usuario: user.nombre_usuario,
      rol: user.rol,
      correo: user.correo,
      identificador_unico: user.identificador_unico,
    },
  });

  return setCORSHeaders(res);
}
