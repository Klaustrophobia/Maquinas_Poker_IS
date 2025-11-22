// services/Recibo.service.ts
import { ReciboRepository } from '@/repositories/Recibo.repository';
import { UsuarioRepository } from '@/repositories/Usuarios.repository';
import { MaquinaRepository } from '@/repositories/Maquina.repository';
import { Recibo } from '@/entities/Recibo';
import { CrearReciboDTO, ReciboResponseDTO, MaquinaReciboDetalleDTO } from '@/dtos/CrearReciboDTO';

export class ReciboService {
  private reciboRepository: ReciboRepository;
  private usuarioRepository: UsuarioRepository;
  private maquinaRepository: MaquinaRepository;

  // Contador para generar números únicos
  private ultimoLote: number = 1000;

  constructor() {
    this.reciboRepository = new ReciboRepository();
    this.usuarioRepository = new UsuarioRepository();
    this.maquinaRepository = new MaquinaRepository();
    this.inicializarUltimoLote();
  }

  private async inicializarUltimoLote() {
    // Buscar el lote más alto en la base de datos
    const recibos = await this.reciboRepository.obtenerTodosLosRecibos();
    if (recibos && recibos.length > 0) {
      const maxLote = Math.max(...recibos.map(r => Number(r.lote_recibo || 0)));
      this.ultimoLote = maxLote;
    } else {
      this.ultimoLote = 1000; // Valor inicial
    }
    console.log(`Último lote inicializado: ${this.ultimoLote}`);
  }

  async generarRecibo(reciboData: CrearReciboDTO): Promise<ReciboResponseDTO> {
    console.log('Iniciando generación de recibo para cliente:', reciboData.cliente_id);
    
    const cliente = await this.usuarioRepository.findById(reciboData.cliente_id);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // GENERAR NÚMERO para el lote (no string)
    const loteRecibo = this.generarNuevoLote();
    
    const recibos: Recibo[] = [];
    let totalIngresos = 0;
    let totalEgresos = 0;

    for (const maquinaData of reciboData.maquinas) {
      const maquina = await this.maquinaRepository.findById(maquinaData.maquina_id);
      if (!maquina) {
        throw new Error(`Máquina con ID ${maquinaData.maquina_id} no encontrada`);
      }

      const recibo = new Recibo();
      recibo.cliente = cliente;
      recibo.maquina = maquina;
      recibo.ingreso = Number(maquinaData.ingreso);
      recibo.egreso = Number(maquinaData.egreso);
      recibo.total = Number(maquinaData.total);
      recibo.fecha_recibo = new Date(reciboData.fecha_recibo);
      recibo.lote_recibo = loteRecibo; // NÚMERO, no string

      recibos.push(recibo);
      totalIngresos += Number(maquinaData.ingreso);
      totalEgresos += Number(maquinaData.egreso);
    }

    console.log('Recibos a guardar:', recibos.length, 'Lote:', loteRecibo);
    const recibosGuardados = await this.reciboRepository.crearMultiplesRecibos(recibos);
    console.log('Recibos guardados:', recibosGuardados.length);

    const grupoId = `lote-${loteRecibo}`;

    const maquinasDetalle: MaquinaReciboDetalleDTO[] = recibosGuardados.map(recibo => ({
      id: recibo.maquina.id,
      nombre: recibo.maquina.nombre,
      codigo: `MAQ-${recibo.maquina.id}`,
      ingreso: Number(recibo.ingreso),
      egreso: Number(recibo.egreso),
      total: Number(recibo.total)
    }));

    const totalNeto = totalIngresos - totalEgresos;
    const parteEmpresa = totalNeto * 0.6;
    const parteCliente = totalNeto * 0.4;

    return {
      id: recibosGuardados[0].id,
      recibo_grupo_id: grupoId,
      lote_recibo: loteRecibo, // NÚMERO
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre_usuario
      },
      maquinas: maquinasDetalle,
      fecha_recibo: reciboData.fecha_recibo,
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      total_neto: totalNeto,
      parte_empresa: parteEmpresa,
      parte_cliente: parteCliente
    };
  }

  async obtenerRecibosPorCliente(clienteId: number): Promise<ReciboResponseDTO[]> {
    const recibos = await this.reciboRepository.obtenerRecibosPorCliente(clienteId);
    return this.agruparRecibosPorLote(recibos);
  }

  async obtenerTodosLosRecibos(): Promise<ReciboResponseDTO[]> {
    const recibos = await this.reciboRepository.obtenerTodosLosRecibos();
    return this.agruparRecibosPorLote(recibos);
  }

  async obtenerReciboPorId(id: number): Promise<ReciboResponseDTO | null> {
    console.log(`=== INICIANDO BÚSQUEDA DE RECIBO ID: ${id} ===`);
    
    const reciboIndividual = await this.reciboRepository.obtenerReciboPorId(id);
    
    if (!reciboIndividual) {
      console.log(`❌ Recibo individual con ID ${id} no encontrado`);
      return null;
    }

    console.log(`✅ Recibo individual encontrado:`, {
      id: reciboIndividual.id,
      cliente_id: reciboIndividual.cliente.id,
      lote_recibo: reciboIndividual.lote_recibo
    });

    // Buscar por lote en lugar de por cliente+fecha
    const recibosDelLote = await this.reciboRepository.obtenerRecibosPorLote(reciboIndividual.lote_recibo);
    
    console.log(`📊 Recibos del lote encontrados: ${recibosDelLote.length}`);

    if (recibosDelLote.length === 0) {
      console.log(`⚠️ No se encontraron otros recibos del lote, pero tenemos el individual`);
      recibosDelLote.push(reciboIndividual);
    }

    const agrupados = this.agruparRecibosPorLote(recibosDelLote);
    
    if (agrupados.length === 0) {
      console.log(`❌ No se pudo agrupar el recibo`);
      return null;
    }

    console.log(`🎉 Recibo agrupado encontrado con ${agrupados[0].maquinas.length} máquina(s)`);
    return agrupados[0];
  }

  async eliminarRecibo(id: number): Promise<boolean> {
    const reciboIndividual = await this.reciboRepository.obtenerReciboPorId(id);
    if (!reciboIndividual) {
      return false;
    }

    // Eliminar todos los recibos del mismo lote
    const recibosDelLote = await this.reciboRepository.obtenerRecibosPorLote(reciboIndividual.lote_recibo);
    
    for (const recibo of recibosDelLote) {
      await this.reciboRepository.eliminarRecibo(recibo.id);
    }
   
    return true;
  }

  private agruparRecibosPorLote(recibos: Recibo[]): ReciboResponseDTO[] {
    const agrupados = new Map<number, ReciboResponseDTO>();

    recibos.forEach(recibo => {
      const lote = recibo.lote_recibo;
     
      if (!agrupados.has(lote)) {
        agrupados.set(lote, {
          id: recibo.id,
          recibo_grupo_id: `lote-${lote}`,
          lote_recibo: lote,
          cliente: {
            id: recibo.cliente.id,
            nombre: recibo.cliente.nombre_usuario
          },
          maquinas: [],
          fecha_recibo: recibo.fecha_recibo.toISOString().split('T')[0],
          total_ingresos: 0,
          total_egresos: 0,
          total_neto: 0,
          parte_empresa: 0,
          parte_cliente: 0
        });
      }

      const grupo = agrupados.get(lote)!;
      
      const ingresoNum = Number(recibo.ingreso);
      const egresoNum = Number(recibo.egreso);
      const totalNum = Number(recibo.total);

      grupo.maquinas.push({
        id: recibo.maquina.id,
        nombre: recibo.maquina.nombre,
        codigo: `MAQ-${recibo.maquina.id}`,
        ingreso: ingresoNum,
        egreso: egresoNum,
        total: totalNum
      });

      grupo.total_ingresos += ingresoNum;
      grupo.total_egresos += egresoNum;
      grupo.total_neto = grupo.total_ingresos - grupo.total_egresos;
      grupo.parte_empresa = grupo.total_neto * 0.6;
      grupo.parte_cliente = grupo.total_neto * 0.4;
    });

    return Array.from(agrupados.values());
  }

  private generarNuevoLote(): number {
    this.ultimoLote += 1;
    console.log(`Nuevo lote generado: ${this.ultimoLote}`);
    return this.ultimoLote;
  }
}