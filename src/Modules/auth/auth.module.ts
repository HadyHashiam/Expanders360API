import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Session } from '../session/session.entity';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { RolesGuard } from './guards/RolesGuard';
import { MailsModule } from '../mails/mails.module';
import { Client } from '../users/clients/entities/client.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  imports: [
    TypeOrmModule.forFeature([User, Session, Client]),
    JwtModule.registerAsync({
      global: true,                                                                   //  global for NestJS module scope
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET_KEY');
        if (!secret) {
          throw new Error('JWT_SECRET_KEY is not defined in .env');
        }
        return {
          secret,
          signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRE_TIME') },
        };
      },
    }),
    MailsModule,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}