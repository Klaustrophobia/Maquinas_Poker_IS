// repositories/LoteRecibo.repository.ts
import { AppDataSource, initializeDatabase } from '@/lib/db';
import { LoteRecibo } from '@/entities/LoteRecibo';
import { Repository, Between } from 'typeorm';

export class LoteReciboRepository {
  private loteReciboRepository: Repository<LoteRecibo>;

  constructor() {
    this.loteReciboRepository = AppDataSource.getRepository(LoteRecibo);
  }

  private async initialize() {
    await initializeDatabase();
  }

  async obtenerTodosLosLotes(): Promise<LoteRecibo[]> {
    await this.initialize();
    return await this.loteReciboRepository.find({
      relations: ['cliente'],
      order: { fecha_recibo: 'DESC', id: 'DESC' }
    });
  }

  async obtenerLotesPorCliente(clienteId: number): Promise<LoteRecibo[]> {
    await this.initialize();
    return await this.loteReciboRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente'],
      order: { fecha_recibo: 'DESC', id: 'DESC' }
    });
  }

  async obtenerLotePorId(id: number): Promise<LoteRecibo | null> {
    await this.initialize();
    return await this.loteReciboRepository.findOne({
      where: { id },
      relations: ['cliente']
    });
  }

  async obtenerLotesPorFecha(inicio: Date, fin: Date): Promise<LoteRecibo[]> {
    await this.initialize();
    return await this.loteReciboRepository.find({
      where: {
        fecha_recibo: Between(inicio, fin)
      },
      relations: ['cliente'],
      order: { fecha_recibo: 'DESC' }
    });
  }

  async eliminarLote(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.loteReciboRepository.delete(id);
    return result.affected !== 0;
  }

  async obtenerLotesConFiltros(filtros: {
    clienteId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Promise<LoteRecibo[]> {
    await this.initialize();
    
    const query = this.loteReciboRepository.createQueryBuilder('lote')
      .leftJoinAndSelect('lote.cliente', 'cliente');

    if (filtros.clienteId) {
      query.andWhere('lote.cliente_id = :clienteId', { clienteId: filtros.clienteId });
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      query.andWhere('lote.fecha_recibo BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      });
    }

    return await query
      .orderBy('lote.fecha_recibo', 'DESC')
      .addOrderBy('lote.id', 'DESC')
      .getMany();
  }
}