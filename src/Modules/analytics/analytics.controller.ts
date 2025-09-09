import { Controller, Get, HttpCode, HttpStatus, UseGuards, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { ApiSecurity, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-vendors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async getTopVendors() {
    return this.analyticsService.getTopVendors();
  }

@Get('vendors-by-country/:countryId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN)
@HttpCode(HttpStatus.OK)
@ApiSecurity('bearer')
@ApiQuery({ name: 'countryId', required: true, type: Number })
async getTopVendorsByCountry(@Param('countryId') countryId: number) {
  return this.analyticsService.getTopVendorsByCountry(countryId);
}

}