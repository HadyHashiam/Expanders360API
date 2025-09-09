import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, ParseIntPipe, UsePipes, Query } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { CurrentUser } from '../users/decorators/user.decorator';
import { JWTPayLoadType } from '../../utils/types/types';
import { VendorsService } from './vendor.service';
import { ApiTags , ApiSecurity } from '@nestjs/swagger';

@ApiTags('Vendors')
@Controller('api/v1/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiSecurity('bearer')
  public async createVendor(@Body() body: CreateVendorDto) {
    return this.vendorsService.createVendor(body);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async getAllVendors(@Query() queryParams: any) {
    return this.vendorsService.getAllVendors(queryParams);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getVendorById(@Param('id', ParseIntPipe) id: number) {
    return this.vendorsService.getVendorById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async updateVendor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVendorDto,
    @CurrentUser() payload: JWTPayLoadType,
  ) {
    return this.vendorsService.updateVendor(id, body, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async deleteVendor(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.vendorsService.deleteVendor(id, payload);
  }
}