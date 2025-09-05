import { Vendor } from '../../vendor/entities/vendor.entity';
import { Project } from '../../projects/entities/project.entity';
import { CURRENT_TIMESTAMP } from '../../../utils/constant';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';


// Match entity representing a project-vendor match in the database
@Entity({ name: 'Matches' })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: number;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  vendorId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 }) // e.g., 85.50
  score: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'boolean', default: false })
  is_sla_expired: boolean;
}