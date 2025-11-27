import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SolicitudReparacion } from "./SolicitudReparacion";
import { Repuesto } from "./Repuesto";

@Entity("repuestos_utilizados")
export class RepuestoUtilizado {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  // Relación unidireccional para evitar problemas
  @ManyToOne(() => SolicitudReparacion)
  @JoinColumn({ name: "solicitud_id" })
  solicitud!: SolicitudReparacion;

  // Relación unidireccional
  @ManyToOne(() => Repuesto)
  @JoinColumn({ name: "repuesto_id" })
  repuesto!: Repuesto;

  @Column({ type: "int", name: "cantidad_utilizada", nullable: false })
  cantidad_utilizada!: number;

  @Column({ type: "timestamp with time zone", name: "fecha_uso", default: () => "now()" })
  fecha_uso!: Date;
}