// repositories/Notificacion.repository.ts
import { AppDataSource } from "@/lib/db";
import { Notificacion } from "@/entities/Notificacion";
import { Usuario } from "@/entities/Usuario";
import { CrearNotificacionDTO } from "@/dtos/NotificacionDTO";

export class NotificacionRepository {
  private notificacionRepository = AppDataSource.getRepository(Notificacion);
  private usuarioRepository = AppDataSource.getRepository(Usuario);

  // Método para verificar que el repositorio esté inicializado
  private ensureInitialized() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }
    if (!this.notificacionRepository) {
      this.notificacionRepository = AppDataSource.getRepository(Notificacion);
    }
  }

  async crearNotificacion(dto: CrearNotificacionDTO): Promise<Notificacion> {
    this.ensureInitialized();
    
    const usuario = await this.usuarioRepository.findOne({
      where: { id: dto.usuario_id }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const notificacion = this.notificacionRepository.create({
      usuario: usuario,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      tipo: dto.tipo,
      relacion_id: dto.relacion_id
    });

    return await this.notificacionRepository.save(notificacion);
  }


  // repositories/Notificacion.repository.ts - Agregar este método
async obtenerNotificacionesRecientes(): Promise<Notificacion[]> {
  this.ensureInitialized();
  
  return await this.notificacionRepository.find({
    where: {
      // Podemos filtrar por fecha reciente (últimas 5 minutos)
      // fecha_creacion: MoreThanOrEqual(new Date(Date.now() - 5 * 60 * 1000))
    },
    relations: ['usuario'],
    order: { fecha_creacion: 'DESC' },
    take: 50 // Límite para no sobrecargar
  });
}

  async obtenerNotificacionesPorUsuario(usuarioId: number, noLeidas?: boolean): Promise<Notificacion[]> {
    this.ensureInitialized();
    
    try {
      const queryBuilder = this.notificacionRepository
        .createQueryBuilder('notificacion')
        .leftJoinAndSelect('notificacion.usuario', 'usuario')
        .where('notificacion.usuario_id = :usuarioId', { usuarioId });

      if (noLeidas !== undefined) {
        queryBuilder.andWhere('notificacion.leida = :leida', { leida: !noLeidas });
      }

      queryBuilder.orderBy('notificacion.fecha_creacion', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error en obtenerNotificacionesPorUsuario:', error);
      
      // Fallback: intentar con find normal si falla el query builder
      const whereClause: { usuario: { id: number }; leida?: boolean } = { usuario: { id: usuarioId } };
      if (noLeidas !== undefined) {
        whereClause.leida = !noLeidas;
      }

      return await this.notificacionRepository.find({
        where: whereClause,
        relations: ['usuario'],
        order: { fecha_creacion: 'DESC' }
      });
    }
  }

  async marcarComoLeida(notificacionId: number): Promise<Notificacion> {
    this.ensureInitialized();
    
    const notificacion = await this.notificacionRepository.findOne({
      where: { id: notificacionId }
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    notificacion.leida = true;
    return await this.notificacionRepository.save(notificacion);
  }

  async marcarTodasComoLeidas(usuarioId: number): Promise<void> {
    this.ensureInitialized();
    
    await this.notificacionRepository
      .createQueryBuilder()
      .update(Notificacion)
      .set({ leida: true })
      .where('usuario_id = :usuarioId', { usuarioId })
      .andWhere('leida = false')
      .execute();
  }

  async obtenerNotificacionesAdministradores(): Promise<Usuario[]> {
    this.ensureInitialized();
    
    return await this.usuarioRepository.find({
      where: [
        { rol: 'Administrador', activo: true },
        { rol: 'SuperAdmin', activo: true }
      ]
    });
  }

  async obtenerUsuarioPorId(usuarioId: number): Promise<Usuario | null> {
    this.ensureInitialized();
    
    return await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });
  }

  async contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
    this.ensureInitialized();
    
    return await this.notificacionRepository.count({
      where: {
        usuario: { id: usuarioId },
        leida: false
      }
    });
  }

  async obtenerNotificacionesPaginadas(
    usuarioId: number, 
    page: number = 1, 
    limit: number = 10
  ): Promise<[Notificacion[], number]> {
    this.ensureInitialized();
    
    const skip = (page - 1) * limit;

    return await this.notificacionRepository.findAndCount({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario'],
      order: { fecha_creacion: 'DESC' },
      skip,
      take: limit
    });
  }
}