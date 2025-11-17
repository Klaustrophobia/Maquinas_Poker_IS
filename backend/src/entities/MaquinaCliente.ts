import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './Usuario';
import { Maquina } from './Maquina';

@Entity({ name: 'maquinas_cliente' })
export class MaquinaCliente {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina: Maquina;

  @Column()
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;
}
