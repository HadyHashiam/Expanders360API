import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { UserType } from '../../utils/enums';
import { Roles } from '../users/decorators/roles.decorator';
import { CurrentUser } from '../users/decorators/user.decorator';
import { JWTPayLoadType } from '../../utils/types/types';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('System-Configs')
@Controller('api/v1/system-configs')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  // POST api/v1/system-configs
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiSecurity('bearer')
  async createSystemConfig(@Body() body: CreateSystemConfigDto, @CurrentUser() payload: JWTPayLoadType) {
    return this.systemConfigService.createSystemConfig(body, payload);
  }

  // GET api/v1/system-configs
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async getAllConfigs(@Query() query: any) {
    return this.systemConfigService.getAllConfigs(query);
  }


  // GET api/v1/system-configs/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async getConfigById(@Param('id', ParseIntPipe) id: number) {
    return this.systemConfigService.getConfigById(id);
  }

  // PATCH api/v1/system-configs/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async updateConfig(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSystemConfigDto, @CurrentUser() payload: JWTPayLoadType) {
    return this.systemConfigService.updateConfig(id, body, payload);
  }

  // DELETE api/v1/system-configs/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async deleteConfig(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.systemConfigService.deleteConfig(id, payload);
  }
}