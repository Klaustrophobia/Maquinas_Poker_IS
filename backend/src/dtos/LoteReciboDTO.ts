// dtos/LoteReciboDTO.ts
export interface LoteReciboDTO {
  id: number;
  cliente: {
    id: number;
    nombre: string;
  };
  fecha_recibo: string;
  ingreso: number;
  egreso: number;
  total: number;
  parte_empresa: number;
  parte_cliente: number;
  cantidad_recibos: number;
  fecha_creacion: string;
}

export interface LoteReciboDetalleDTO extends LoteReciboDTO {
  recibos: ReciboLoteDetalleDTO[];
}

export interface ReciboLoteDetalleDTO {
  id: number;
  maquina: {
    id: number;
    nombre: string;
    codigo: string;
  };
  ingreso: number;
  egreso: number;
  total: number;
  fecha_recibo: string;
}