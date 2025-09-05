import { Injectable, ForbiddenException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { Resource_Name, UserType, Models_Name } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { HandlerFactory } from '../../utils/handlerfactory/handler-factory.postgres';


@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);
  private factory: HandlerFactory<Vendor>;

  constructor(
    @InjectRepository(Vendor)
    public readonly vendorRepository: Repository<Vendor>,
  ) {
    this.factory = new HandlerFactory<Vendor>(this.vendorRepository);
  }


  public async createVendor(createVendorDto: CreateVendorDto): Promise<{ message: string, status: string, data: Vendor | Vendor[] }> {
    const existingVendor = await this.vendorRepository.findOne({ where: { name: createVendorDto.name } });
    if (existingVendor) {
      this.logger.warn(`Vendor with name ${createVendorDto.name} already exists`);
      throw new ConflictException(`Vendor with name ${createVendorDto.name} already exists`);
    }
    const result = await this.factory.create(createVendorDto);
    return { message: 'Vendor created Successfully', status: 'success', data: result };
  }

  async getAllVendors(query: any, req?: Request): Promise<{ message: string, status: string; results: number; pagination: any; data: Vendor[] }> {
    const result = await this.factory.getAll(query, Resource_Name.VENDORS, Models_Name.VENDOR);

    return { message: "Vendors Retrieved Successfully", status: 'success', results: result.data.length, pagination: result.pagination, data: result.data };
  }


  public async getVendorById(id: number): Promise<{ status: string; data: Vendor }> {
    const result = await this.factory.getOne(id);
    return { status: 'success', data: result };
  }



  public async updateVendor(id: number, updateVendorDto: UpdateVendorDto, payload: JWTPayLoadType): Promise<{ message: string, status: string, data: Vendor }> {
    if (updateVendorDto.name) {
      const existingVendor = await this.vendorRepository.findOne({
        where: { name: updateVendorDto.name, id: Not(id) },
      });
      if (existingVendor) {
        this.logger.warn(`Vendor with name ${updateVendorDto.name} already exists`);
        throw new ConflictException(`Vendor with name ${updateVendorDto.name} already exists`);
      }
    }
    const vendor = await this.factory.getOne(id);
    const res = Object.assign(vendor, updateVendorDto);
    const result = this.factory.updateOne(id, vendor)
    return { message: "Vendor Updated Successfully", status: "Success", data: res }
  }

  public async deleteVendor(id: number, payload: JWTPayLoadType): Promise<{ message: string }> {
    if (payload.userType !== UserType.ADMIN) {
      this.logger.warn(`Unauthorized attempt to delete vendor by user: ${payload.id}`);
      throw new ForbiddenException('Only admins can delete vendors');
    }
    return this.factory.deleteOne(id);
  }
}