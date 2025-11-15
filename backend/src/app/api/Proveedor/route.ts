import { NextRequest } from "next/server";
import { ProveedorController } from "../../../controllers/Proveedor.controller";

const proveedorController = new ProveedorController();

export async function GET() {
  return await proveedorController.obtenerTodosLosProveedores();
}

export async function POST(req: NextRequest) {
  return await proveedorController.crearProveedor(req);
}