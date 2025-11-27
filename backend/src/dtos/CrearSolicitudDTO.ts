export interface CrearSolicitudDTO {
  cliente_id: number;
  maquina_id: number;
  descripcion_falla: string;
  gravedad: 'leve' | 'moderada' | 'grave';
}

export interface AsignarTecnicoDTO {
  tecnico_id: number;
  fecha_hora_reparacion: string; // ISO string
}

export interface ReparacionTerminadaDTO {
  observaciones_tecnico: string;
  repuestos_utilizados?: RepuestoUtilizadoDTO[];
}

export interface RepuestoUtilizadoDTO {
  repuesto_id: number;
  cantidad_utilizada: number;
}

export interface AgregarRepuestoDTO {
  repuesto_id: number;
  cantidad_utilizada: number;
}

export interface FiltroSolicitudesDTO {
  estado?: string;
  cliente_id?: number;
  tecnico_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}