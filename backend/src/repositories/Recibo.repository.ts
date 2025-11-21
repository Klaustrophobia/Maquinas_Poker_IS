// repositories/Recibo.repository.ts
import { AppDataSource, initializeDatabase } from '@/lib/db';
import { Recibo } from '@/entities/Recibo';
import { Repository, Between } from 'typeorm';

export class ReciboRepository {
  private reciboRepository: Repository<Recibo>;

  constructor() {
    this.reciboRepository = AppDataSource.getRepository(Recibo);
  }

  private async initialize() {
    await initializeDatabase();
  }

  async crearRecibo(reciboData: Partial<Recibo>): Promise<Recibo> {
    await this.initialize();
    const recibo = this.reciboRepository.create(reciboData);
    return await this.reciboRepository.save(recibo);
  }

  async crearMultiplesRecibos(recibosData: Partial<Recibo>[]): Promise<Recibo[]> {
    await this.initialize();
    const recibos = this.reciboRepository.create(recibosData);
    return await this.reciboRepository.save(recibos);
  }

  async obtenerRecibosPorCliente(clienteId: number): Promise<Recibo[]> {
    await this.initialize();
    return await this.reciboRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente', 'maquina'],
      order: { fecha_recibo: 'DESC', id: 'DESC' }
    });
  }

  async obtenerReciboPorId(id: number): Promise<Recibo | null> {
    await this.initialize();
    return await this.reciboRepository.findOne({
      where: { id },
      relations: ['cliente', 'maquina']
    });
  }

  async obtenerRecibosPorFecha(inicio: Date, fin: Date): Promise<Recibo[]> {
    await this.initialize();
    return await this.reciboRepository.find({
      where: {
        fecha_recibo: Between(inicio, fin)
      },
      relations: ['cliente', 'maquina'],
      order: { fecha_recibo: 'DESC' }
    });
  }

  async obtenerRecibosPorReciboId(reciboId: number): Promise<Recibo[]> {
    await this.initialize();
    
    const reciboPrincipal = await this.reciboRepository.findOne({
      where: { id: reciboId },
      relations: ['cliente', 'maquina']
    });

    if (!reciboPrincipal) {
      return [];
    }

    // AHORA BUSCAMOS POR LOTE (número)
    return await this.reciboRepository.find({
      where: { lote_recibo: reciboPrincipal.lote_recibo },
      relations: ['cliente', 'maquina'],
      order: { id: 'ASC' }
    });
  }

  // NUEVO MÉTODO: Obtener recibos por lote (CORREGIDO - ahora usa number)
  async obtenerRecibosPorLote(loteRecibo: number): Promise<Recibo[]> {
    await this.initialize();
    
    return await this.reciboRepository.find({
      where: { lote_recibo: loteRecibo },
      relations: ['cliente', 'maquina'],
      order: { id: 'ASC' }
    });
  }

  async eliminarRecibo(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.reciboRepository.delete(id);
    return result.affected !== 0;
  }

  async obtenerTodosLosRecibos(): Promise<Recibo[]> {
    await this.initialize();
    return await this.reciboRepository.find({
      relations: ['cliente', 'maquina'],
      order: { fecha_recibo: 'DESC', id: 'DESC' }
    });
  }
}