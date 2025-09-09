import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../../utils/constant';
import { Session } from '../../session/session.entity';
import { UserType } from '../../../utils/enums';


@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '150', nullable: true })
  username: string;

  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;

  
  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'varchar', length: '20', default: UserType.CLIENT })
  userType: UserType;


  @Column({ default: false })
  isAccountVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: '250', nullable: true })
  emailVerificationToken:  string | null;

  
  @Exclude()
  @Column({ type: 'varchar', length: '250', nullable: true })
  resetPasswordToken:  string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpiresAt: Date | null;


  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}