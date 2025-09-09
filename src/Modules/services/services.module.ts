import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService, HandlerFactory],
  exports: [ServicesService],
})
export class ServicesModule {}
