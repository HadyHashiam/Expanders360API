import { Injectable, ForbiddenException, Logger, ConflictException, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, In } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { Resource_Name, UserType, Models_Name } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ApiResponseUtil } from '../../utils/types/api-response.util';
import { PaginationMeta } from '../../utils/types/api-response.types';
import { VendorWithNamesDto } from './dto/vendor-response.dto';


@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);
  private factory: HandlerFactory<Vendor>;

  constructor(
    @InjectRepository(Vendor)
    public readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {
    this.factory = new HandlerFactory<Vendor>(this.vendorRepository);
  }


  public async createVendor(createVendorDto: CreateVendorDto): Promise<ReturnType<typeof ApiResponseUtil.created<Vendor | Vendor[]>>> {
    try {
      // Validate countries_supported
      if (createVendorDto.countries_supported) {
        const countries = await this.countryRepository.find({ where: { id: In(createVendorDto.countries_supported) } });
        if (countries.length !== createVendorDto.countries_supported.length) {
          throw new NotFoundException('One or more country IDs not found');
        }
      }
      // Validate services_offered
      if (createVendorDto.services_offered?.length) {
        const services = await this.serviceRepository.find({ where: { id: In(createVendorDto.services_offered) } });
        if (services.length !== createVendorDto.services_offered.length) {
          throw new BadRequestException('One or more services_offered are invalid');
        }
      }

      const existingVendor = await this.vendorRepository.findOne({ where: { name: createVendorDto.name } });
      if (existingVendor) {
        this.logger.warn(`Vendor with name ${createVendorDto.name} already exists`);
        throw new ConflictException(`Vendor with name ${createVendorDto.name} already exists`);
      }
      const result = await this.factory.create(createVendorDto);
      return ApiResponseUtil.created(result, 'Vendor');
    } catch (error) {
      this.logger.error(`Failed to create vendor: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create vendor');
    }
  }

  async getAllVendors(query: any, req?: Request): Promise<{ status: string; message: string; results: number; pagination: PaginationMeta; data: VendorWithNamesDto[] }> {
    const result = await this.factory.getAll(query, Resource_Name.VENDORS, Models_Name.VENDOR);
    
    // Transform vendors to include names
    const vendorsWithNames = await this.transformVendorsWithNames(result.data);
    
    return {
      status: 'success',
      message: 'Vendors Retrieved Successfully',
      results: vendorsWithNames.length,
      pagination: result.pagination,
      data: vendorsWithNames,
    };
  }

  /**
   * Transform vendors to include country and service names
   * Comment this function to disable enhanced response
   */
  private async transformVendorsWithNames(vendors: Vendor[]): Promise<VendorWithNamesDto[]> {
    // Get all unique country and service IDs
    const allCountryIds = [...new Set(vendors.flatMap(v => v.countries_supported))];
    const allServiceIds = [...new Set(vendors.flatMap(v => v.services_offered))];
    
    // Fetch all countries and services
    const countries = await this.countryRepository.find({ where: { id: In(allCountryIds) } });
    const services = await this.serviceRepository.find({ where: { id: In(allServiceIds) } });
    
    // Create lookup maps
    const countryMap = new Map(countries.map(c => [c.id, c.name]));
    const serviceMap = new Map(services.map(s => [s.id, s.name]));
    
    // Transform vendors
    return vendors.map(vendor => ({
      ...vendor,
      countries_supported_names: vendor.countries_supported.map(id => countryMap.get(id) || `Unknown Country ${id}`),
      services_offered_names: vendor.services_offered.map(id => serviceMap.get(id) || `Unknown Service ${id}`)
    }));
  }


  public async getVendorById(id: number): Promise<ReturnType<typeof ApiResponseUtil.success<Vendor>>> {
    const result = await this.factory.getOne(id);
    return ApiResponseUtil.success(result, 'Vendor Retrieved Successfully');
  }



  public async updateVendor(id: number, updateVendorDto: UpdateVendorDto, payload: JWTPayLoadType): Promise<ReturnType<typeof ApiResponseUtil.updated<Vendor>>> {
    try {
      if (updateVendorDto.countries_supported) {
        const countries = await this.countryRepository.find({ where: { id: In(updateVendorDto.countries_supported) } });
        if (countries.length !== updateVendorDto.countries_supported.length) {
          throw new NotFoundException('One or more country IDs not found');
        }
      }
      if (updateVendorDto.services_offered?.length) {
        const services = await this.serviceRepository.find({ where: { id: In(updateVendorDto.services_offered) } });
        if (services.length !== updateVendorDto.services_offered.length) {
          throw new BadRequestException('One or more services_offered are invalid');
        }
      }

      if (updateVendorDto.name) {
        const existingVendor = await this.vendorRepository.findOne({ where: { name: updateVendorDto.name, id: Not(id) } });
        if (existingVendor) {
          this.logger.warn(`Vendor with name ${updateVendorDto.name} already exists`);
          throw new ConflictException(`Vendor with name ${updateVendorDto.name} already exists`);
        }
      }
      const result = await this.factory.updateOne(id, updateVendorDto);
      return ApiResponseUtil.updated(result, 'Vendor');
    } catch (error) {
      this.logger.error(`Failed to update vendor ID ${id}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update vendor');
    }
  }

  public async deleteVendor(id: number, payload: JWTPayLoadType):Promise<{ message: string; data: any; status: string }> {
    if (payload.userType !== UserType.ADMIN) {
      this.logger.warn(`Unauthorized attempt to delete vendor by user: ${payload.id}`);
      throw new ForbiddenException('Only admins can delete vendors');
    }
    return await this.factory.deleteOne(id );
  }
}