import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  nombre_usuario: string;

  @Column({ name: "contraseña" })
  contraseña: string;

  @Column()
  rol: string;

  @Column({ unique: true })
  correo: string;

  @Column({ type: "timestamp with time zone", default: () => "now()" })
  fecha_creacion: Date;

  @Column({ nullable: true })
  identificador_unico?: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  codigo_login?: string;
}
