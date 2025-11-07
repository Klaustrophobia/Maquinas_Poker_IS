import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Proveedor } from "./Proveedor";

@Entity({ name: "repuestos" })
export class Repuesto {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text", nullable: false })
  nombre!: string;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor?: Proveedor;

  @Column({ type: "int", nullable: false })
  cantidad!: number;

  @Column({ type: "text", nullable: true })
  ubicacion!: string;

  @Column({ type: "text", nullable: false })
  estado!: string;
}
