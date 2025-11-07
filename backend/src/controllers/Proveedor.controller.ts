import { NextRequest, NextResponse } from "next/server";
import { ProveedorService } from "../services/Proveedor.service";

export class ProveedorController {
  private proveedorService = new ProveedorService();

  async obtenerTodosLosProveedores() {
    try {
      const proveedores =
        await this.proveedorService.obtenerTodosLosProveedores();
      return NextResponse.json(proveedores, { status: 200 });
    } catch {
      return NextResponse.json(
        { mensaje: "Error al obtener proveedores" },
        { status: 500 }
      );
    }
  }

  async obtenerProveedorPorId(id: number) {
    try {
      const proveedor = await this.proveedorService.obtenerProveedorPorId(id);
      if (proveedor) {
        return NextResponse.json(proveedor, { status: 200 });
      } else {
        return NextResponse.json(
          { mensaje: "Proveedor no encontrado" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { mensaje: "Error al obtener proveedor" },
        { status: 500 }
      );
    }
  }

  async crearProveedor(req: NextRequest) {
    try {
      const body = await req.json();
      const nuevoProveedor = await this.proveedorService.crearProveedor(body);
      return NextResponse.json(nuevoProveedor, { status: 201 });
    } catch {
      return NextResponse.json(
        { mensaje: "Error al crear proveedor" },
        { status: 500 }
      );
    }
  }

  async actualizarDatosProveedor(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      const proveedorActualizado =
        await this.proveedorService.actualizarDatosProveedor(id, body);
      if (proveedorActualizado) {
        return NextResponse.json(proveedorActualizado, { status: 200 });
      } else {
        return NextResponse.json(
          { mensaje: "Proveedor no encontrado" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { mensaje: "Error al actualizar proveedor" },
        { status: 500 }
      );
    }
  }

  async eliminarProveedor(id: number) {
    try {
      const eliminado = await this.proveedorService.eliminarProveedor(id);

      if (eliminado) {
        return new NextResponse(null, { status: 204 });
      } else {
        return NextResponse.json(
          { mensaje: "Proveedor no encontrado" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { mensaje: "Error al eliminar proveedor" },
        { status: 500 }
      );
    }
  }
}