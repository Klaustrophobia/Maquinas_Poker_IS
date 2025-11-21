// dtos/CrearReciboDTO.ts
export interface CrearReciboDTO {
  cliente_id: number;
  maquinas: MaquinaReciboDTO[];
  fecha_recibo: string;
  lote_recibo?: number; // Opcional, se genera automáticamente si no se envía
}

export interface MaquinaReciboDTO {
  maquina_id: number;
  ingreso: number;
  egreso: number;
  total: number;
}

export interface ReciboResponseDTO {
  id: number;
  recibo_grupo_id?: string;
  lote_recibo: number; // NUEVO
  cliente: {
    id: number;
    nombre: string;
  };
  maquinas: MaquinaReciboDetalleDTO[];
  fecha_recibo: string;
  total_ingresos: number;
  total_egresos: number;
  total_neto: number;
  parte_empresa: number;
  parte_cliente: number;
}

export interface MaquinaReciboDetalleDTO {
  id: number;
  nombre: string;
  codigo: string;
  ingreso: number;
  egreso: number;
  total: number;
}