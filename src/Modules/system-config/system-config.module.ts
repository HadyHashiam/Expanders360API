import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';
import { SystemConfig } from './entities/system-config.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  controllers: [SystemConfigController],
  providers: [SystemConfigService, HandlerFactory],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}