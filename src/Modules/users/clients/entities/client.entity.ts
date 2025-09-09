import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CURRENT_TIMESTAMP } from '../../../../utils/constant';

@Entity({ name: 'Clients' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150' })
  company_name: string;

  @Column({ type: 'varchar', length: '250', unique: true })
  contact_email: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

   @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;
  
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => CURRENT_TIMESTAMP,
      onUpdate: CURRENT_TIMESTAMP,
    })
    updatedAt: Date;
}