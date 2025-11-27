import { NextRequest } from "next/server";
import { SolicitudReparacionService } from "@/services/SolicitudReparacion.service";
import {
  CrearSolicitudDTO,
  AsignarTecnicoDTO,
  ReparacionTerminadaDTO,
  FiltroSolicitudesDTO
} from "@/dtos/CrearSolicitudDTO";

export class SolicitudReparacionController {
  private solicitudService: SolicitudReparacionService;

  constructor() {
    this.solicitudService = new SolicitudReparacionService();
  }

  // Crear nueva solicitud
  crearSolicitud = async (req: NextRequest) => {
    try {
      const dto: CrearSolicitudDTO = await req.json();
      
      const solicitud = await this.solicitudService.crearSolicitud(dto);
      
      return {
        success: true,
        data: solicitud,
        message: "Solicitud creada exitosamente"
      };
    } catch (error) {
      console.error("Error en crearSolicitud:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al crear solicitud"
      };
    }
  };

  // Obtener todas las solicitudes (con filtros opcionales)
  obtenerSolicitudes = async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const filtros: FiltroSolicitudesDTO = {
        estado: searchParams.get('estado') as string,
        cliente_id: searchParams.get('cliente_id') ? parseInt(searchParams.get('cliente_id') as string) : undefined,
        tecnico_id: searchParams.get('tecnico_id') ? parseInt(searchParams.get('tecnico_id') as string) : undefined,
        fecha_desde: searchParams.get('fecha_desde') as string,
        fecha_hasta: searchParams.get('fecha_hasta') as string
      };

      const solicitudes = await this.solicitudService.obtenerSolicitudes(filtros);
      
      return {
        success: true,
        data: solicitudes,
        count: solicitudes.length
      };
    } catch (error) {
      console.error("Error en obtenerSolicitudes:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener solicitudes",
        data: [],
        count: 0
      };
    }
  };

  // Obtener solicitud por ID
  obtenerSolicitudPorId = async (id: string) => {
    try {
      const solicitudId = parseInt(id);
      
      if (isNaN(solicitudId)) {
        return {
          success: false,
          message: "ID de solicitud inválido"
        };
      }

      const solicitud = await this.solicitudService.obtenerSolicitudPorId(solicitudId);
      
      return {
        success: true,
        data: solicitud
      };
    } catch (error) {
      console.error("Error en obtenerSolicitudPorId:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener solicitud"
      };
    }
  };

  // Asignar técnico a solicitud
  asignarTecnico = async (id: string, req: NextRequest) => {
    try {
      const solicitudId = parseInt(id);
      
      if (isNaN(solicitudId)) {
        return {
          success: false,
          message: "ID de solicitud inválido"
        };
      }

      const dto: AsignarTecnicoDTO = await req.json();
      
      const solicitud = await this.solicitudService.asignarTecnico(solicitudId, dto);
      
      return {
        success: true,
        data: solicitud,
        message: "Técnico asignado exitosamente"
      };
    } catch (error) {
      console.error("Error en asignarTecnico:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al asignar técnico"
      };
    }
  };

  // Marcar reparación como terminada
  marcarReparacionTerminada = async (id: string, req: NextRequest) => {
    try {
      const solicitudId = parseInt(id);
      
      if (isNaN(solicitudId)) {
        return {
          success: false,
          message: "ID de solicitud inválido"
        };
      }

      const dto: ReparacionTerminadaDTO = await req.json();
      
      const solicitud = await this.solicitudService.marcarReparacionTerminada(solicitudId, dto);
      
      return {
        success: true,
        data: solicitud,
        message: "Reparación marcada como terminada exitosamente"
      };
    } catch (error) {
      console.error("Error en marcarReparacionTerminada:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al marcar reparación como terminada"
      };
    }
  };

  // Finalizar solicitud
  finalizarSolicitud = async (id: string) => {
    try {
      const solicitudId = parseInt(id);
      
      if (isNaN(solicitudId)) {
        return {
          success: false,
          message: "ID de solicitud inválido"
        };
      }

      const solicitud = await this.solicitudService.finalizarSolicitud(solicitudId);
      
      return {
        success: true,
        data: solicitud,
        message: "Solicitud finalizada exitosamente"
      };
    } catch (error) {
      console.error("Error en finalizarSolicitud:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al finalizar solicitud"
      };
    }
  };

  // Obtener técnicos activos
  obtenerTecnicosActivos = async () => {
    try {
      const tecnicos = await this.solicitudService.obtenerTecnicosActivos();
      
      return {
        success: true,
        data: tecnicos,
        count: tecnicos.length
      };
    } catch (error) {
      console.error("Error en obtenerTecnicosActivos:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener técnicos"
      };
    }
  };

  // Método específico para la ruta /asignar-tecnico
  asignarTecnicoDesdeBody = async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { solicitud_id, tecnico_id, fecha_hora_reparacion } = body;

      if (!solicitud_id || !tecnico_id || !fecha_hora_reparacion) {
        return {
          success: false,
          message: "Faltan campos requeridos"
        };
      }

      const solicitudId = parseInt(solicitud_id.toString());
      
      if (isNaN(solicitudId)) {
        return {
          success: false,
          message: "ID de solicitud inválido"
        };
      }

      const dto = { tecnico_id, fecha_hora_reparacion };
      const solicitud = await this.solicitudService.asignarTecnico(solicitudId, dto);
      
      return {
        success: true,
        data: solicitud,
        message: "Técnico asignado exitosamente"
      };
    } catch (error) {
      console.error("Error en asignarTecnicoDesdeBody:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al asignar técnico"
      };
    }
  }

  // Obtener repuestos utilizados en una solicitud
obtenerRepuestosUtilizados = async (id: string) => {
  try {
    const solicitudId = parseInt(id);
    
    if (isNaN(solicitudId)) {
      return {
        success: false,
        message: "ID de solicitud inválido"
      };
    }

    const repuestos = await this.solicitudService.obtenerRepuestosUtilizados(solicitudId);
    
    return {
      success: true,
      data: repuestos,
      count: repuestos.length
    };
  } catch (error) {
    console.error("Error en obtenerRepuestosUtilizados:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al obtener repuestos utilizados"
    };
  }
};

  // Agregar repuesto utilizado
  agregarRepuestoUtilizado = async (id: string, req: NextRequest) => {
    try {
      const solicitudId = parseInt(id);
      const { repuesto_id, cantidad_utilizada } = await req.json();
      
      if (isNaN(solicitudId) || isNaN(repuesto_id) || isNaN(cantidad_utilizada)) {
        return {
          success: false,
          message: "Parámetros inválidos"
        };
      }

      const repuestoUtilizado = await this.solicitudService.agregarRepuestoUtilizado(
        solicitudId,
        repuesto_id,
        cantidad_utilizada
      );
      
      return {
        success: true,
        data: repuestoUtilizado,
        message: "Repuesto agregado exitosamente"
      };
    } catch (error) {
      console.error("Error en agregarRepuestoUtilizado:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al agregar repuesto"
      };
    }
  };
}