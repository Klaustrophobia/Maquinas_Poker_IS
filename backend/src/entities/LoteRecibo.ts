// entities/LoteRecibo.ts
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from './Usuario';

@Entity('lotes_recibos')
export class LoteRecibo {
  @PrimaryColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Usuario;

  @Column({ type: 'timestamp with time zone', name: 'fecha_recibo' })
  fecha_recibo!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ingreso!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  egreso!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'parte_empresa' })
  parteEmpresa!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'parte_cliente' })
  parteCliente!: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @Column({ type: 'integer', default: 0, name: 'cantidad_recibos' })
  cantidadRecibos!: number;
}