import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum EstadoMaquina {
  FUNCIONANDO = 'Funcionando',
  MANTENIMIENTO = 'Mantenimiento',
  FUERA_DE_SERVICIO = 'Fuera de servicio'
}

@Entity({ name: "maquinas" })
export class Maquina {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text", nullable: false })
  nombre!: string;

  @Column({ type: "text", nullable: false })
  tipo!: string;

  @Column({ 
    type: "enum", 
    enum: EstadoMaquina, 
    nullable: false 
  })
  estado!: EstadoMaquina;

  @Column({ type: "text", nullable: false })
  ubicacion!: string;

  @Column({ type: "date", nullable: true })
  fecha_compra!: Date;

  @Column({ type: "date", nullable: true })
  fecha_garantia!: Date;
}