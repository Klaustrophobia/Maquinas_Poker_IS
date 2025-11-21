// services/LoteRecibo.service.ts
import { LoteReciboRepository } from '@/repositories/LoteRecibo.repository';
import { ReciboRepository } from '@/repositories/Recibo.repository';
import { LoteReciboDTO, LoteReciboDetalleDTO } from '@/dtos/LoteReciboDTO';
import { Recibo } from '@/entities/Recibo';

export class LoteReciboService {
  private loteReciboRepository: LoteReciboRepository;
  private reciboRepository: ReciboRepository;

  constructor() {
    this.loteReciboRepository = new LoteReciboRepository();
    this.reciboRepository = new ReciboRepository();
  }

  async obtenerTodosLosLotes(): Promise<LoteReciboDTO[]> {
    const lotes = await this.loteReciboRepository.obtenerTodosLosLotes();
    return this.mapearLotesADTO(lotes);
  }

  async obtenerLotesPorCliente(clienteId: number): Promise<LoteReciboDTO[]> {
    const lotes = await this.loteReciboRepository.obtenerLotesPorCliente(clienteId);
    return this.mapearLotesADTO(lotes);
  }

  async obtenerLotePorId(id: number): Promise<LoteReciboDetalleDTO | null> {
    const lote = await this.loteReciboRepository.obtenerLotePorId(id);
    
    if (!lote) {
      return null;
    }

    // Obtener los recibos detallados de este lote
    const recibos = await this.reciboRepository.obtenerRecibosPorLote(id);

    return {
      ...this.mapearLoteADTO(lote),
      recibos: recibos.map(recibo => ({
        id: recibo.id,
        maquina: {
          id: recibo.maquina.id,
          nombre: recibo.maquina.nombre,
          codigo: `MAQ-${recibo.maquina.id}`
        },
        ingreso: Number(recibo.ingreso),
        egreso: Number(recibo.egreso),
        total: Number(recibo.total),
        fecha_recibo: recibo.fecha_recibo.toISOString().split('T')[0]
      }))
    };
  }

  async obtenerLotesConFiltros(filtros: {
    clienteId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<LoteReciboDTO[]> {
    const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : undefined;
    const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : undefined;

    const lotes = await this.loteReciboRepository.obtenerLotesConFiltros({
      clienteId: filtros.clienteId,
      fechaInicio,
      fechaFin
    });

    return this.mapearLotesADTO(lotes);
  }

  async eliminarLote(id: number): Promise<boolean> {
    // Primero eliminamos los recibos individuales del lote
    const recibosDelLote = await this.reciboRepository.obtenerRecibosPorLote(id);
    
    for (const recibo of recibosDelLote) {
      await this.reciboRepository.eliminarRecibo(recibo.id);
    }

    // Luego eliminamos el lote (esto debería hacerlo automáticamente el trigger)
    return await this.loteReciboRepository.eliminarLote(id);
  }

  private mapearLotesADTO(lotes: any[]): LoteReciboDTO[] {
    return lotes.map(lote => this.mapearLoteADTO(lote));
  }

  private mapearLoteADTO(lote: any): LoteReciboDTO {
    return {
      id: lote.id,
      cliente: {
        id: lote.cliente.id,
        nombre: lote.cliente.nombre_usuario
      },
      fecha_recibo: lote.fecha_recibo.toISOString().split('T')[0],
      ingreso: Number(lote.ingreso),
      egreso: Number(lote.egreso),
      total: Number(lote.total),
      parte_empresa: Number(lote.parteEmpresa),
      parte_cliente: Number(lote.parteCliente),
      cantidad_recibos: lote.cantidadRecibos,
      fecha_creacion: lote.fecha_creacion.toISOString()
    };
  }
}