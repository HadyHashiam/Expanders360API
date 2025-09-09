import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ApiResponseUtil } from '../../utils/types/api-response.util';
import { PaginationMeta } from '../../utils/types/api-response.types';
import { Resource_Name, Models_Name } from '../../utils/enums';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  private factory: HandlerFactory<Service>;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {
    this.factory = new HandlerFactory<Service>(this.serviceRepository);
  }

  async getAllServices(query: any): Promise<{ status?: 'success'; success: true; message: string; data: Service[]; count?: number; timestamp: string; pagination: PaginationMeta }> {
    const result = await this.factory.getAll(query, Resource_Name.SERVICES, Models_Name.SERVICE);
    return ApiResponseUtil.successPaginated<Service>(result.data, result.pagination, 'Services Retrieved Successfully');
  }

  async getServiceById(id: number): Promise<ReturnType<typeof ApiResponseUtil.success<Service>>> {
    const service = await this.factory.getOne(id);
    return ApiResponseUtil.success(service, 'Service Retrieved Successfully');
  }

  async createService(createServiceDto: any): Promise<ReturnType<typeof ApiResponseUtil.created<Service>>> {
    const created = await this.factory.create(createServiceDto);
    return ApiResponseUtil.created(created as Service, 'Service');
  }

  async updateService(id: number, updateServiceDto: any): Promise<ReturnType<typeof ApiResponseUtil.updated<Service>>> {
    const updated = await this.factory.updateOne(id, updateServiceDto);
    return ApiResponseUtil.updated(updated as Service, 'Service');
  }

  async deleteService(id: number): Promise<{ message: string; data: any; status: string }> {
    return this.factory.deleteOne(id);
  }
}
