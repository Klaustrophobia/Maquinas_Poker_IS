import { NextRequest, NextResponse } from "next/server";
import { RepuestoController } from "@/controllers/Repuestos.controller";

const repuestoController = new RepuestoController();

export async function GET(request: NextRequest) {
  return await repuestoController.getAllRepuestos(request);
}

export async function POST(request: NextRequest) {
  return await repuestoController.createRepuesto(request);
}