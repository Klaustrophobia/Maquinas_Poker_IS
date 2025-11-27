// dtos/NotificacionDTO.ts
export interface CrearNotificacionDTO {
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  relacion_id?: number;
  enviar_email?: boolean; // Nuevo campo para controlar envío de email
}

export interface NotificacionResponseDTO {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
  relacion_id?: number;
  usuario: {
    id: number;
    nombre_usuario: string;
    correo: string; // Añadir email en la respuesta
  };
}

// Tipos de notificaciones para mejor control
export type TipoNotificacion = 
  | 'solicitud_creada'
  | 'nueva_solicitud'
  | 'tecnico_asignado'
  | 'orden_trabajo'
  | 'reparacion_completada'
  | 'reparacion_finalizada'
  | 'sistema'
  | 'general';