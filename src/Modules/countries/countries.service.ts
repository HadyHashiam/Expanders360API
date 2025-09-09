import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ApiResponseUtil } from '../../utils/types/api-response.util';
import { PaginationMeta } from '../../utils/types/api-response.types';
import { Resource_Name, Models_Name } from '../../utils/enums';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);
  private factory: HandlerFactory<Country>;

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {
    this.factory = new HandlerFactory<Country>(this.countryRepository);
  }

  async getAllCountries(query: any): Promise<{ status?: 'success'; success: true; message: string; data: Country[]; count?: number; timestamp: string; pagination: PaginationMeta }> {
    const result = await this.factory.getAll(query, Resource_Name.COUNTRIES, Models_Name.COUNTRY);
    return ApiResponseUtil.successPaginated<Country>(result.data, result.pagination, 'Countries Retrieved Successfully');
  }

  async getCountryById(id: number): Promise<ReturnType<typeof ApiResponseUtil.success<Country>>> {
    const country = await this.factory.getOne(id);
    return ApiResponseUtil.success(country, 'Country Retrieved Successfully');
  }

  async createCountry(createCountryDto: any): Promise<ReturnType<typeof ApiResponseUtil.created<Country>>> {
    const created = await this.factory.create(createCountryDto);
    return ApiResponseUtil.created(created as Country, 'Country');
  }

  async updateCountry(id: number, updateCountryDto: any): Promise<ReturnType<typeof ApiResponseUtil.updated<Country>>> {
    const updated = await this.factory.updateOne(id, updateCountryDto);
    return ApiResponseUtil.updated(updated as Country, 'Country');
  }

  async deleteCountry(id: number): Promise<{ message: string; data: any; status: string }> {
    return this.factory.deleteOne(id);
  }
}
