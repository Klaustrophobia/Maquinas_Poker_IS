import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SolicitudReparacion } from "./SolicitudReparacion";
import { Repuesto } from "./Repuesto";

@Entity("repuestos_utilizados")
export class RepuestoUtilizado {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne(() => SolicitudReparacion, (solicitud: SolicitudReparacion) => solicitud.repuestos_utilizados)
  @JoinColumn({ name: "solicitud_id" })
  solicitud!: SolicitudReparacion;

  @ManyToOne(() => Repuesto)
  @JoinColumn({ name: "repuesto_id" })
  repuesto!: Repuesto;

  @Column({ type: "int", nullable: false })
  cantidad_utilizada!: number;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_uso!: Date;
}