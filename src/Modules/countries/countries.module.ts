import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { Country } from './entities/country.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountriesController],
  providers: [CountriesService, HandlerFactory],
  exports: [CountriesService],
})
export class CountriesModule {}
