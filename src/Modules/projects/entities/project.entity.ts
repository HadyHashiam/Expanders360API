import { CURRENT_TIMESTAMP } from '../../../utils/constant';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Client } from '../../users/clients/entities/client.entity';
import { ProjectStatus } from '../../../utils/enums';

@Entity({ name: 'Projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '100' })
  country: string;

  @Column({ type: 'varchar', length: '200' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  services_needed: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budget: number;

  @Column({ type: 'varchar', length: '50', default: ProjectStatus.PENDING })
  status: string;


  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;


  @Column()
  clientId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}