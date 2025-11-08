import { NextRequest, NextResponse } from "next/server";
import { MaquinaService } from "@/services/Maquina.service";
import { EstadoMaquina } from "@/entities/Maquina";

export class MaquinaController {
  private maquinaService: MaquinaService;

  constructor() {
    this.maquinaService = new MaquinaService();
  }

  async getAllMaquinas(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const estado = searchParams.get("estado") as EstadoMaquina;
      const tipo = searchParams.get("tipo");
      const search = searchParams.get("search");

      if (estado) {
        if (!Object.values(EstadoMaquina).includes(estado)) {
          return NextResponse.json(
            { error: "Estado no válido" },
            { status: 400 }
          );
        }
        const maquinas = await this.maquinaService.getMaquinasByEstado(estado);
        return NextResponse.json(maquinas);
      } else if (tipo) {
        const maquinas = await this.maquinaService.getMaquinasByTipo(tipo);
        return NextResponse.json(maquinas);
      } else if (search) {
        const maquinas = await this.maquinaService.searchMaquinasByName(search);
        return NextResponse.json(maquinas);
      } else {
        const maquinas = await this.maquinaService.getAllMaquinas();
        return NextResponse.json(maquinas);
      }
    } catch (error) {
      console.error("Error en MaquinaController.getAllMaquinas:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async createMaquina(request: NextRequest) {
    try {
      const body = await request.json();
      const { nombre, tipo, estado, ubicacion, fecha_compra, fecha_garantia } = body;

      if (!nombre || !tipo || !estado || !ubicacion) {
        return NextResponse.json(
          { error: "Nombre, tipo, estado y ubicación son requeridos" },
          { status: 400 }
        );
      }

      if (!Object.values(EstadoMaquina).includes(estado)) {
        return NextResponse.json(
          { error: "Estado no válido. Los estados permitidos son: operativa, mantenimiento, desuso, reparacion" },
          { status: 400 }
        );
      }

      const maquina = await this.maquinaService.createMaquina({
        nombre,
        tipo,
        estado,
        ubicacion,
        fecha_compra: fecha_compra ? new Date(fecha_compra) : undefined,
        fecha_garantia: fecha_garantia ? new Date(fecha_garantia) : undefined
      });

      return NextResponse.json(maquina, { status: 201 });
    } catch (error) {
      console.error("Error en MaquinaController.createMaquina:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async getMaquinaById(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const maquina = await this.maquinaService.getMaquinaById(numericId);

      if (!maquina) {
        return NextResponse.json(
          { error: "Máquina no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(maquina);
    } catch (error) {
      console.error("Error en MaquinaController.getMaquinaById:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async updateMaquina(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { nombre, tipo, estado, ubicacion, fecha_compra, fecha_garantia } = body;

      const maquinaExistente = await this.maquinaService.getMaquinaById(numericId);
      if (!maquinaExistente) {
        return NextResponse.json(
          { error: "Máquina no encontrada" },
          { status: 404 }
        );
      }

      if (estado && !Object.values(EstadoMaquina).includes(estado)) {
        return NextResponse.json(
          { error: "Estado no válido. Los estados permitidos son: operativa, mantenimiento, desuso, reparacion" },
          { status: 400 }
        );
      }

      const maquinaActualizada = await this.maquinaService.updateMaquina(numericId, {
        nombre,
        tipo,
        estado,
        ubicacion,
        fecha_compra: fecha_compra ? new Date(fecha_compra) : undefined,
        fecha_garantia: fecha_garantia ? new Date(fecha_garantia) : undefined
      });

      return NextResponse.json(maquinaActualizada);
    } catch (error) {
      console.error("Error en MaquinaController.updateMaquina:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }

  async deleteMaquina(request: NextRequest, id: string) {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "ID debe ser un número válido" },
          { status: 400 }
        );
      }

      const maquinaExistente = await this.maquinaService.getMaquinaById(numericId);
      if (!maquinaExistente) {
        return NextResponse.json(
          { error: "Máquina no encontrada" },
          { status: 404 }
        );
      }

      const deleted = await this.maquinaService.deleteMaquina(numericId);
      return NextResponse.json({ 
        success: deleted,
        message: "Máquina eliminada correctamente" 
      });
    } catch (error) {
      console.error("Error en MaquinaController.deleteMaquina:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
}