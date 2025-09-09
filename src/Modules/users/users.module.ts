import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ClientsModule } from './clients/clients.module';

@Module({
    imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService ,HandlerFactory],

  exports: [UsersService],
})
export class UsersModule {}