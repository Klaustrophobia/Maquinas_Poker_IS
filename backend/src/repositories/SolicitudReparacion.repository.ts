import { AppDataSource, initializeDatabase } from "@/lib/db";
import { SolicitudReparacion, EstadoSolicitud, GravedadFalla } from "@/entities/SolicitudReparacion";
import { RepuestoUtilizado } from "@/entities/RepuestoUtilizado";
import { Usuario } from "@/entities/Usuario";
import { Maquina } from "@/entities/Maquina";
import { Repuesto } from "@/entities/Repuesto";
import {
  CrearSolicitudDTO,
  AsignarTecnicoDTO,
  ReparacionTerminadaDTO,
  FiltroSolicitudesDTO
} from "@/dtos/CrearSolicitudDTO";

export class SolicitudReparacionRepository {
  
  // Método simple para inicializar repositorios
  private async init() {
    await initializeDatabase();
  }

  async crearSolicitud(dto: CrearSolicitudDTO): Promise<SolicitudReparacion> {
    await this.init();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que el cliente existe
      const cliente = await AppDataSource.getRepository(Usuario).findOne({
        where: { id: dto.cliente_id, rol: 'Cliente' }
      });
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar que la máquina existe
      const maquina = await AppDataSource.getRepository(Maquina).findOne({
        where: { id: dto.maquina_id }
      });
      if (!maquina) {
        throw new Error('Máquina no encontrada');
      }

      // Crear la solicitud
      const solicitud = AppDataSource.getRepository(SolicitudReparacion).create({
        cliente: { id: dto.cliente_id } as Usuario,
        maquina: { id: dto.maquina_id } as Maquina,
        descripcion_falla: dto.descripcion_falla,
        gravedad: dto.gravedad as GravedadFalla,
        estado: EstadoSolicitud.PENDIENTE
      });

      const savedSolicitud = await queryRunner.manager.save(solicitud);
      await queryRunner.commitTransaction();
      return savedSolicitud;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerSolicitudes(filtros?: FiltroSolicitudesDTO): Promise<SolicitudReparacion[]> {
    await this.init();
    
    const queryBuilder = AppDataSource.getRepository(SolicitudReparacion)
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.cliente', 'cliente')
      .leftJoinAndSelect('solicitud.maquina', 'maquina')
      .leftJoinAndSelect('solicitud.tecnico_asignado', 'tecnico_asignado');

    if (filtros?.estado) {
      queryBuilder.andWhere('solicitud.estado = :estado', { estado: filtros.estado });
    }

    if (filtros?.cliente_id) {
      queryBuilder.andWhere('solicitud.cliente_id = :cliente_id', { cliente_id: filtros.cliente_id });
    }

    if (filtros?.tecnico_id) {
      queryBuilder.andWhere('solicitud.tecnico_asignado_id = :tecnico_id', { tecnico_id: filtros.tecnico_id });
    }

    if (filtros?.fecha_desde) {
      queryBuilder.andWhere('solicitud.fecha_creacion >= :fecha_desde', { fecha_desde: filtros.fecha_desde });
    }

    if (filtros?.fecha_hasta) {
      queryBuilder.andWhere('solicitud.fecha_creacion <= :fecha_hasta', { fecha_hasta: filtros.fecha_hasta });
    }

    queryBuilder.orderBy('solicitud.fecha_creacion', 'DESC');

    return await queryBuilder.getMany();
  }

  async obtenerSolicitudPorId(id: number): Promise<SolicitudReparacion | null> {
    await this.init();
    
    return await AppDataSource.getRepository(SolicitudReparacion).findOne({
      where: { id },
      relations: [
        'cliente',
        'maquina',
        'tecnico_asignado'
      ]
    });
  }

  async asignarTecnico(solicitudId: number, dto: AsignarTecnicoDTO): Promise<SolicitudReparacion> {
    await this.init();

    const solicitud = await AppDataSource.getRepository(SolicitudReparacion).findOne({
      where: { id: solicitudId },
      relations: ['cliente', 'maquina', 'tecnico_asignado']
    });

    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    // Verificar que el técnico existe
    const tecnico = await AppDataSource.getRepository(Usuario).findOne({
      where: { id: dto.tecnico_id, rol: 'Tecnico' }
    });
    if (!tecnico) {
      throw new Error('Técnico no encontrado');
    }

    solicitud.tecnico_asignado = tecnico;
    solicitud.fecha_hora_reparacion = new Date(dto.fecha_hora_reparacion);
    solicitud.estado = EstadoSolicitud.TECNICO_ASIGNADO;
    solicitud.fecha_actualizacion = new Date();

    return await AppDataSource.getRepository(SolicitudReparacion).save(solicitud);
  }

  async obtenerTecnicosActivos(): Promise<Usuario[]> {
    await this.init();
    
    return await AppDataSource.getRepository(Usuario).find({
      where: { rol: 'Tecnico', activo: true },
      order: { nombre_usuario: 'ASC' }
    });
  }

  async marcarReparacionTerminada(solicitudId: number, dto: ReparacionTerminadaDTO): Promise<SolicitudReparacion> {
    await this.init();
    
    // CARGAR RELACIONES NECESARIAS - ESTA ES LA CORRECCIÓN PRINCIPAL
    const solicitud = await AppDataSource.getRepository(SolicitudReparacion).findOne({
      where: { id: solicitudId },
      relations: ['cliente', 'maquina', 'tecnico_asignado'] // Agregar relaciones aquí
    });

    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    solicitud.estado = EstadoSolicitud.PREFINALIZADA;
    solicitud.observaciones_tecnico = dto.observaciones_tecnico;
    solicitud.fecha_reparacion_terminada = new Date();
    solicitud.fecha_actualizacion = new Date();

    return await AppDataSource.getRepository(SolicitudReparacion).save(solicitud);
  }

  async finalizarSolicitud(solicitudId: number): Promise<SolicitudReparacion> {
    await this.init();
    
    // CARGAR RELACIONES NECESARIAS
    const solicitud = await AppDataSource.getRepository(SolicitudReparacion).findOne({
      where: { id: solicitudId },
      relations: ['cliente', 'tecnico_asignado']
    });

    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    solicitud.estado = EstadoSolicitud.FINALIZADA;
    solicitud.fecha_finalizada = new Date();
    solicitud.fecha_actualizacion = new Date();

    return await AppDataSource.getRepository(SolicitudReparacion).save(solicitud);
  }

  async agregarRepuestoUtilizado(solicitudId: number, repuestoId: number, cantidad: number): Promise<RepuestoUtilizado> {
    await this.init();
    
    const solicitud = await AppDataSource.getRepository(SolicitudReparacion).findOne({
      where: { id: solicitudId }
    });
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    const repuesto = await AppDataSource.getRepository(Repuesto).findOne({
      where: { id: repuestoId }
    });
    if (!repuesto) {
      throw new Error('Repuesto no encontrado');
    }

    // Verificar stock suficiente
    if (repuesto.cantidad < cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${repuesto.cantidad}, Solicitado: ${cantidad}`);
    }

    const repuestoUtilizado = AppDataSource.getRepository(RepuestoUtilizado).create({
      solicitud: solicitud,
      repuesto: repuesto,
      cantidad_utilizada: cantidad
    });

    // Actualizar stock del repuesto
    repuesto.cantidad = repuesto.cantidad - cantidad;
    await AppDataSource.getRepository(Repuesto).save(repuesto);

    return await AppDataSource.getRepository(RepuestoUtilizado).save(repuestoUtilizado);
  }

  async obtenerRepuestosUtilizados(solicitudId: number): Promise<RepuestoUtilizado[]> {
  await this.init();
  
  return await AppDataSource.getRepository(RepuestoUtilizado).find({
    where: { 
      solicitud: { id: solicitudId } 
    },
    relations: [
      'repuesto',
      'solicitud'
    ],
    order: {
      id: 'ASC'
    }
  });
}
}