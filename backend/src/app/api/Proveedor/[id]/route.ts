import { NextRequest } from "next/server";
import { ProveedorController } from "../../../../controllers/Proveedor.controller";

const proveedorController = new ProveedorController();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);
  return await proveedorController.obtenerProveedorPorId(numId);
}

export async function PUT(req: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);
  return await proveedorController.actualizarDatosProveedor(numId, req);
}