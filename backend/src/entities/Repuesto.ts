import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity({ name: "repuestos" })
export class Repuesto {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text", nullable: false })
  nombre!: string;

  @ManyToOne("Proveedor", "repuestos", { nullable: false, onDelete: "SET NULL" })
  @JoinColumn({ name: "proveedor_id" })
  proveedor!: any;

  @Column({ type: "int", nullable: false })
  cantidad!: number;

  @Column({ type: "text", nullable: true })
  ubicacion!: string;

  @Column({ type: "text", nullable: false })
  estado!: string;
}