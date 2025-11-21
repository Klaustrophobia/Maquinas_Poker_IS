// entities/Recibo.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from './Usuario';
import { Maquina } from './Maquina';

@Entity('recibos')
export class Recibo {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Usuario;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina!: Maquina;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ingreso!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  egreso!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'timestamp with time zone', name: 'fecha_recibo' })
  fecha_recibo!: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;

  // CAMBIO IMPORTANTE: Cambiar de string a number
  @Column({ type: 'bigint', name: 'lote_recibo' })
  lote_recibo!: number; // ← Ahora es number, no string
}