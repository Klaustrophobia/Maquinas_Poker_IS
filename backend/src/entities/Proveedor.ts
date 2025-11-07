import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "proveedores" })
export class Proveedor {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: false })
  nombre!: string;

  @Column()
  informacion_contacto?: string;

  @Column()
  direccion?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion?: Date;

}
