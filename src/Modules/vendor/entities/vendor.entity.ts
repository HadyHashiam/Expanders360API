import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { CURRENT_TIMESTAMP } from '../../../utils/constant';

@Entity({ name: 'Vendors' })
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150' })
  name: string;

  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;

  @Column({ type: 'json' }) 
  countries_supported: string[];

  @Column({ type: 'json' }) 
  services_offered: string[];

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  rating: number;

  @Column({ type: 'float' }) 
  response_sla_hours: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}