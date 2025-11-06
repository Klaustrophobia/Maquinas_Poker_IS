import { Entity, PrimaryGeneratedColumn, OneToMany, Column, CreateDateColumn } from "typeorm";
import { Repuesto } from "./Repuestos";

@Entity({ name: "proveedores" })
export class Proveedor {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text", nullable: false })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  informacion_contacto!: string;

  @Column({ type: "text", nullable: true })
  direccion!: string;

  @CreateDateColumn({ type: "timestamptz", name: "fecha_creacion", default: () => "now()" })
  fecha_creacion: Date = new Date();

  // Relación con la entidad Repuesto
  @OneToMany(() => Repuesto, (repuesto) => repuesto.proveedor)
  repuestos: Repuesto[] = [];
}
