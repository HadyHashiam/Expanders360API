import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorsController } from './vendor.controller';
import { VendorsService } from './vendor.service';
import { HandlerFactory } from '../../utils/handlerfactory/handler-factory.postgres';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService, HandlerFactory],
  imports: [
    TypeOrmModule.forFeature([Vendor]),
  ],
  exports: [VendorsService],
})
export class VendorsModule {}