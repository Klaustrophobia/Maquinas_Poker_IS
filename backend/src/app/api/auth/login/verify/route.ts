import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { AuthController } from "@/controllers/AuthController";
import { applyCorsHeaders } from "@/lib/cors";

const tokenCookieName = "auth_token";
const tokenTtlSeconds = 60 * 60 * 2;

export async function OPTIONS(req: NextRequest) {
  return applyCorsHeaders(req, new NextResponse(null, { status: 204 }), "POST,OPTIONS");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { correo, codigo_login } = body;

    if (!correo || !codigo_login) {
      return applyCorsHeaders(req, NextResponse.json({ error: "Correo y código son requeridos" }, { status: 400 }), "POST,OPTIONS");
    }

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    const controller = new AuthController();
    const result = await controller.confirmarLogin(correo, codigo_login);

    const response = NextResponse.json({
      message: result.message,
      usuario: result.user,
      token: result.token,
    });

    response.cookies.set({
      name: tokenCookieName,
      value: result.token,
      httpOnly: true,
      // cross-site cookie for frontend hosted on a different origin
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: tokenTtlSeconds,
      path: "/",
    });

    return applyCorsHeaders(req, response, "POST,OPTIONS");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar la solicitud";
    return applyCorsHeaders(req, NextResponse.json({ error: message }, { status: 400 }), "POST,OPTIONS");
  }
}
