// src/entities/MaquinaCliente.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "@/entities/Usuario";
import { Maquina } from "@/entities/Maquina";

@Entity("maquinas_cliente")
export class MaquinaCliente {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: "cliente_id" })
  cliente!: Usuario;

  @ManyToOne(() => Maquina, { eager: true })
  @JoinColumn({ name: "maquina_id" })
  maquina!: Maquina;

  @Column()
  estado!: string;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_asignacion!: Date;
}
