import { NextRequest, NextResponse } from "next/server";
import { RepuestoService } from "@/services/Repuestos.service";

export class RepuestoController {
  private repuestoService: RepuestoService;

  constructor() {
    this.repuestoService = new RepuestoService();
  }

  async getAllRepuestos(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");

      if (search) {
        const repuestos = await this.repuestoService.searchRepuestosByName(search);
        return NextResponse.json(repuestos);
      } else {
        const repuestos = await this.repuestoService.getAllRepuestos();
        return NextResponse.json(repuestos);
      }
    } catch (error) {
      console.error("Error en RepuestoController.getAllRepuestos:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async createRepuesto(request: NextRequest) {
    try {
      const body = await request.json();
      const { nombre, proveedor_id, cantidad, ubicacion, estado } = body;

      if (!nombre || !proveedor_id || !cantidad || !estado) {
        return NextResponse.json(
          { error: "Nombre, proveedor_id, cantidad y estado son requeridos" },
          { status: 400 }
        );
      }

      const repuesto = await this.repuestoService.createRepuesto({
        nombre,
        proveedor_id: parseInt(proveedor_id),
        cantidad: parseInt(cantidad),
        ubicacion,
        estado
      });

      return NextResponse.json(repuesto, { status: 201 });
    } catch (error) {
      console.error("Error en RepuestoController.createRepuesto:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async getRepuestoById(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const repuesto = await this.repuestoService.getRepuestoById(numericId);

      if (!repuesto) {
        return NextResponse.json(
          { error: "Repuesto no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(repuesto);
    } catch (error) {
      console.error("Error en RepuestoController.getRepuestoById:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async updateRepuesto(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { nombre, cantidad, ubicacion, estado, proveedor_id } = body;

      const repuestoExistente = await this.repuestoService.getRepuestoById(numericId);
      if (!repuestoExistente) {
        return NextResponse.json(
          { error: "Repuesto no encontrado" },
          { status: 404 }
        );
      }

      const repuestoActualizado = await this.repuestoService.updateRepuesto(numericId, {
        nombre,
        cantidad: cantidad ? parseInt(cantidad) : undefined,
        ubicacion,
        estado,
        proveedor_id: proveedor_id ? parseInt(proveedor_id) : undefined
      });

      return NextResponse.json(repuestoActualizado);
    } catch (error) {
      console.error("Error en RepuestoController.updateRepuesto:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async deleteRepuesto(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const repuestoExistente = await this.repuestoService.getRepuestoById(numericId);
      if (!repuestoExistente) {
        return NextResponse.json(
          { error: "Repuesto no encontrado" },
          { status: 404 }
        );
      }

      const deleted = await this.repuestoService.deleteRepuesto(numericId);
      return NextResponse.json({ 
        success: deleted,
        message: "Repuesto eliminado correctamente" 
      });
    } catch (error) {
      console.error("Error en RepuestoController.deleteRepuesto:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
}