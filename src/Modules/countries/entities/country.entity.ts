import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Countries' })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '100', unique: true })
  name: string;
}
