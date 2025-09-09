import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { HandlerFactory } from '../../../utils/handlerFactory/handler-factory.postgres';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService , HandlerFactory],
  imports: [
    TypeOrmModule.forFeature([Client]),
  ],
  exports: [ClientsService],
})
export class ClientsModule {}