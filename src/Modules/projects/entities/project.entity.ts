import { CURRENT_TIMESTAMP } from '../../../utils/constant';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../../users/clients/entities/client.entity';
import { Country } from '../../countries/entities/country.entity';
import { ProjectStatus } from '../../../utils/enums';

@Entity({ name: 'Projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @Column()
  countryId: number;

  @Column({ type: 'varchar', length: '200' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  services_needed: number[];

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

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}