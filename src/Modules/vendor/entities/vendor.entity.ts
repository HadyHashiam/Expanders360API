import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { CURRENT_TIMESTAMP } from '../../../utils/constant';
import { Country } from '../../countries/entities/country.entity';
import { Service } from '../../services/entities/service.entity';

@Entity({ name: 'Vendors' })
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150' })
  name: string;

  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;

  @Column({ type: 'json' }) 
  countries_supported: number[];

  @Column({ type: 'json' }) 
  services_offered: number[];

  // New normalized relations (kept alongside JSON arrays during transition)
  @ManyToMany(() => Country, { cascade: false })
  @JoinTable({ name: 'vendors_countries', joinColumn: { name: 'vendorId' }, inverseJoinColumn: { name: 'countryId' } })
  countries?: Country[];

  @ManyToMany(() => Service, { cascade: false })
  @JoinTable({ name: 'vendors_services', joinColumn: { name: 'vendorId' }, inverseJoinColumn: { name: 'serviceId' } })
  services?: Service[];

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  rating: number;

  @Column({ type: 'float' }) 
  response_sla_hours: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}