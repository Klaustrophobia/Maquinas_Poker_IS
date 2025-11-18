// src/controllers/MaquinaCliente.controller.ts
import { MaquinaClienteService } from "@/services/MaquinaCliente.service";

const service = new MaquinaClienteService();

export class MaquinaClienteController {
  static async asignar(data: { cliente_id: number; maquina_id: number }) {
    const { cliente_id, maquina_id } = data;
    return await service.asignar(cliente_id, maquina_id);
  }

  static async listar(cliente_id: number) {
    return await service.listarPorCliente(cliente_id);
  }

  static async desasignar(maquina_id: number) {
    return await service.desasignar(maquina_id);
  }

  static async reasignar(data: { 
    maquina_id: number; 
    nuevo_cliente_id: number;
    cliente_anterior_id?: number; // Opcional para validaciones
  }) {
    const { maquina_id, nuevo_cliente_id, cliente_anterior_id } = data;
    return await service.reasignar(maquina_id, nuevo_cliente_id, cliente_anterior_id);
  }

  static async obtenerClienteActual(maquina_id: number) {
    return await service.obtenerClienteActual(maquina_id);
  }
}