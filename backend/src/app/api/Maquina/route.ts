import { NextRequest, NextResponse } from "next/server";
import { MaquinaController } from "@/controllers/Maquina.controller";

const maquinaController = new MaquinaController();

export async function GET(request: NextRequest) {
  return await maquinaController.getAllMaquinas(request);
}

export async function POST(request: NextRequest) {
  return await maquinaController.createMaquina(request);
}