import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { VendorsController } from './vendor.controller';
import { VendorsService } from './vendor.service';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService, HandlerFactory],
  imports: [
    TypeOrmModule.forFeature([Vendor, Country, Service]),
  ],
  exports: [VendorsService],
})
export class VendorsModule {}