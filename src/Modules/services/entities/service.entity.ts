import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Services' })
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '100', unique: true })
  name: string;
}
