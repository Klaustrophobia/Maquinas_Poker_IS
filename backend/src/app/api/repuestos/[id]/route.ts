import { NextRequest, NextResponse } from "next/server";
import { RepuestoController } from "@/controllers/Repuestos.controller";

const repuestoController = new RepuestoController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await repuestoController.getRepuestoById(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await repuestoController.updateRepuesto(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await repuestoController.deleteRepuesto(request, id);
}