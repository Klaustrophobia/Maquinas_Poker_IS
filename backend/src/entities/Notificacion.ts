import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("notificaciones")
export class Notificacion {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @Column({ type: "text", nullable: false })
  titulo!: string;

  @Column({ type: "text", nullable: false })
  mensaje!: string;

  @Column({ type: "text", nullable: false })
  tipo!: string;

  @Column({ default: false })
  leida!: boolean;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_creacion!: Date;

  @Column({ type: "bigint", nullable: true })
  relacion_id?: number;
}