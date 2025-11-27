import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { Maquina } from "./Maquina";
import { RepuestoUtilizado } from "./RepuestoUtilizado";

export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  TECNICO_ASIGNADO = 'tecnico_asignado',
  PREFINALIZADA = 'prefinalizada',
  FINALIZADA = 'finalizada'
}

export enum GravedadFalla {
  LEVE = 'leve',
  MODERADA = 'moderada',
  GRAVE = 'grave'
}

@Entity("solicitudes_reparacion")
export class SolicitudReparacion {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "cliente_id" })
  cliente!: Usuario;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: "maquina_id" })
  maquina!: Maquina;

  @Column({ type: "text", nullable: false })
  descripcion_falla!: string;

  @Column({
    type: "enum",
    enum: GravedadFalla,
    nullable: false
  })
  gravedad!: GravedadFalla;

  @Column({
    type: "enum",
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE
  })
  estado!: EstadoSolicitud;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "tecnico_asignado_id" })
  tecnico_asignado?: Usuario;

  @Column({ type: "timestamp with time zone", nullable: true })
  fecha_hora_reparacion?: Date;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_creacion!: Date;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_actualizacion!: Date;

  @Column({ type: "text", nullable: true })
  observaciones_tecnico?: string;

  @Column({ type: "timestamp with time zone", nullable: true })
  fecha_reparacion_terminada?: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  fecha_finalizada?: Date;

  // SOLUCIÓN: Usar tipo any temporalmente para romper la dependencia circular
  @OneToMany(() => require("./RepuestoUtilizado").RepuestoUtilizado, (repuestoUtilizado: any) => repuestoUtilizado.solicitud)
  repuestos_utilizados!: any[];
}