import { SolicitudReparacionRepository } from "@/repositories/SolicitudReparacion.repository";
import { NotificacionRepository } from "@/repositories/Notificacion.repository";
import { 
  CrearSolicitudDTO, 
  AsignarTecnicoDTO, 
  ReparacionTerminadaDTO,
  FiltroSolicitudesDTO 
} from "@/dtos/CrearSolicitudDTO";
import { SolicitudReparacion } from "@/entities/SolicitudReparacion";
import { Usuario } from "@/entities/Usuario";
import { RepuestoUtilizado } from "@/entities/RepuestoUtilizado";

export class SolicitudReparacionService {
  private solicitudRepository: SolicitudReparacionRepository;
  private notificacionRepository: NotificacionRepository;

  constructor() {
    this.solicitudRepository = new SolicitudReparacionRepository();
    this.notificacionRepository = new NotificacionRepository();
  }

  async crearSolicitud(dto: CrearSolicitudDTO): Promise<SolicitudReparacion> {
    try {
      const solicitud = await this.solicitudRepository.crearSolicitud(dto);

      // Crear notificación para administradores
      const administradores = await this.notificacionRepository.obtenerNotificacionesAdministradores();
      
      for (const admin of administradores) {
        await this.notificacionRepository.crearNotificacion({
          usuario_id: admin.id,
          titulo: 'Nueva Solicitud de Reparación',
          mensaje: `Se ha creado una nueva solicitud de reparación con gravedad: ${dto.gravedad}`,
          tipo: 'nueva_solicitud',
          relacion_id: solicitud.id
        });
      }

      return solicitud;
    } catch (error) {
      console.error('Error en SolicitudReparacionService.crearSolicitud:', error);
      throw new Error(`Error al crear solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async asignarTecnico(solicitudId: number, dto: AsignarTecnicoDTO): Promise<SolicitudReparacion> {
    try {
      const solicitud = await this.solicitudRepository.asignarTecnico(solicitudId, dto);

      // Notificar al cliente
      await this.notificacionRepository.crearNotificacion({
        usuario_id: solicitud.cliente.id,
        titulo: 'Técnico Asignado',
        mensaje: `Se ha asignado un técnico para su solicitud. Fecha de reparación: ${new Date(dto.fecha_hora_reparacion).toLocaleString()}`,
        tipo: 'tecnico_asignado',
        relacion_id: solicitud.id
      });

      // Notificar al técnico
      await this.notificacionRepository.crearNotificacion({
        usuario_id: dto.tecnico_id,
        titulo: 'Nueva Orden de Trabajo',
        mensaje: `Se le ha asignado una nueva orden de trabajo para el ${new Date(dto.fecha_hora_reparacion).toLocaleString()}`,
        tipo: 'orden_trabajo',
        relacion_id: solicitud.id
      });

      return solicitud;
    } catch (error) {
      console.error('Error en SolicitudReparacionService.asignarTecnico:', error);
      throw new Error(`Error al asignar técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async marcarReparacionTerminada(solicitudId: number, dto: ReparacionTerminadaDTO): Promise<SolicitudReparacion> {
    try {
      const solicitud = await this.solicitudRepository.marcarReparacionTerminada(solicitudId, dto);

      // VALIDAR QUE EL CLIENTE EXISTA ANTES DE CREAR NOTIFICACIÓN
      if (!solicitud.cliente || !solicitud.cliente.id) {
        console.warn('Cliente no encontrado en la solicitud, saltando notificación');
        return solicitud;
      }

      // Notificar al cliente
      await this.notificacionRepository.crearNotificacion({
        usuario_id: solicitud.cliente.id,
        titulo: 'Reparación Completada',
        mensaje: 'El técnico ha completado la reparación. Por favor verifique el funcionamiento.',
        tipo: 'reparacion_completada',
        relacion_id: solicitud.id
      });

      return solicitud;
    } catch (error) {
      console.error('Error en SolicitudReparacionService.marcarReparacionTerminada:', error);
      throw new Error(`Error al marcar reparación como terminada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async finalizarSolicitud(solicitudId: number): Promise<SolicitudReparacion> {
    try {
      const solicitud = await this.solicitudRepository.finalizarSolicitud(solicitudId);

      // Notificar a administradores
      const administradores = await this.notificacionRepository.obtenerNotificacionesAdministradores();
      
      for (const admin of administradores) {
        await this.notificacionRepository.crearNotificacion({
          usuario_id: admin.id,
          titulo: 'Reparación Finalizada',
          mensaje: `La reparación #${solicitud.id} ha sido finalizada exitosamente.`,
          tipo: 'reparacion_finalizada',
          relacion_id: solicitud.id
        });
      }

      // Notificar al técnico si existe
      if (solicitud.tecnico_asignado) {
        await this.notificacionRepository.crearNotificacion({
          usuario_id: solicitud.tecnico_asignado.id,
          titulo: 'Reparación Finalizada',
          mensaje: 'La reparación ha sido finalizada y aceptada por el cliente.',
          tipo: 'reparacion_finalizada',
          relacion_id: solicitud.id
        });
      }

      return solicitud;
    } catch (error) {
      console.error('Error en SolicitudReparacionService.finalizarSolicitud:', error);
      throw new Error(`Error al finalizar solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async obtenerSolicitudes(filtros?: FiltroSolicitudesDTO): Promise<SolicitudReparacion[]> {
    try {
      return await this.solicitudRepository.obtenerSolicitudes(filtros);
    } catch (error) {
      console.error('Error en SolicitudReparacionService.obtenerSolicitudes:', error);
      throw new Error(`Error al obtener solicitudes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async obtenerSolicitudPorId(id: number): Promise<SolicitudReparacion> {
    try {
      const solicitud = await this.solicitudRepository.obtenerSolicitudPorId(id);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }
      return solicitud;
    } catch (error) {
      console.error('Error en SolicitudReparacionService.obtenerSolicitudPorId:', error);
      throw new Error(`Error al obtener solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async obtenerTecnicosActivos(): Promise<Usuario[]> {
    try {
      return await this.solicitudRepository.obtenerTecnicosActivos();
    } catch (error) {
      console.error('Error en SolicitudReparacionService.obtenerTecnicosActivos:', error);
      throw new Error(`Error al obtener técnicos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async agregarRepuestoUtilizado(solicitudId: number, repuestoId: number, cantidad: number): Promise<RepuestoUtilizado> {
    try {
      return await this.solicitudRepository.agregarRepuestoUtilizado(solicitudId, repuestoId, cantidad);
    } catch (error) {
      console.error('Error en SolicitudReparacionService.agregarRepuestoUtilizado:', error);
      throw new Error(`Error al agregar repuesto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async obtenerRepuestosUtilizados(solicitudId: number): Promise<RepuestoUtilizado[]> {
  try {
    return await this.solicitudRepository.obtenerRepuestosUtilizados(solicitudId);
  } catch (error) {
    console.error('Error en SolicitudReparacionService.obtenerRepuestosUtilizados:', error);
    throw new Error(`Error al obtener repuestos utilizados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
}