import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Permitir requests desde tu frontend
  res.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Responder a OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: res.headers });
  }

  return res;
}

// Aplicar middleware a todas las rutas de la API
export const config = {
  matcher: "/api/:path*",
};
