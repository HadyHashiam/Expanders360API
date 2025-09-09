import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { SystemConfig } from './entities/system-config.entity';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);
  private factory: HandlerFactory<SystemConfig>;

  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {
    this.factory = new HandlerFactory<SystemConfig>(this.systemConfigRepository);
  }

  async createSystemConfig(createSystemConfigDto: CreateSystemConfigDto, payload: JWTPayLoadType): Promise<SystemConfig> {
    if (payload.userType !== UserType.ADMIN) {
      this.logger.warn(`Unauthorized attempt to create config by user: ${payload.id}`);
      throw new ForbiddenException('Only admins can create system configs');
    }
    const existingConfig = await this.systemConfigRepository.findOne({ where: { key: createSystemConfigDto.key } });
    if (existingConfig) {
      this.logger.warn(`Attempt to create duplicate config key: ${createSystemConfigDto.key}`);
      throw new BadRequestException(`Configuration with key '${createSystemConfigDto.key}' already exists`);
    }
    try {
      const config = this.systemConfigRepository.create(createSystemConfigDto);
      return await this.systemConfigRepository.save(config);
    } catch (error) {
      this.logger.error(`Failed to create config: ${error.message}`);
      throw new InternalServerErrorException('Failed to create configuration');
    }
  }

  async getConfigValue(key: string, defaultValue: number): Promise<number> {
    try {
      const config = await this.systemConfigRepository.findOne({ where: { key } });
      return config ? config.value : defaultValue;
    } catch (error) {
      this.logger.error(`Failed to fetch config value for key ${key}: ${error.message}`);
      return defaultValue;
    }
  }

  async getAllConfigs(query: any): Promise<{ status: string; results: number; pagination: any; data: SystemConfig[] }> {
    return this.factory.getAll(query, 'systemConfigs', 'config');
  }

  async getConfigById(id: number): Promise<SystemConfig> {
    return this.factory.getOne(id);
  }

  async updateConfig(id: number, updateConfigDto: UpdateSystemConfigDto, payload: JWTPayLoadType): Promise<SystemConfig> {
    if (payload.userType !== UserType.ADMIN) {
      this.logger.warn(`Unauthorized attempt to update config by user: ${payload.id}`);
      throw new ForbiddenException('Only admins can update system configs');
    }
    if (updateConfigDto.key) {
      const existingConfig = await this.systemConfigRepository.findOne({
        where: { key: updateConfigDto.key, id: Not(id) },
      });
      if (existingConfig) {
        this.logger.warn(`Attempt to update to duplicate config key: ${updateConfigDto.key}`);
        throw new BadRequestException(`Configuration with key '${updateConfigDto.key}' already exists`);
      }
    }
    const config = await this.factory.getOne(id);
    Object.assign(config, updateConfigDto);
    return this.factory.updateOne(id, config);
  }

  async deleteConfig(id: number, payload: JWTPayLoadType): Promise<{ message: string }> {
    if (payload.userType !== UserType.ADMIN) {
      this.logger.warn(`Unauthorized attempt to delete config by user: ${payload.id}`);
      throw new ForbiddenException('Only admins can delete system configs');
    }
    return this.factory.deleteOne(id);
  }
}