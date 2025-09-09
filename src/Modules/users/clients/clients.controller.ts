import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JWTPayLoadType } from '../../../utils/types/types';
import { CurrentUser } from '../decorators/user.decorator';
import { RolesGuard } from '../../auth/guards/RolesGuard';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { UserType } from '../../../utils/enums';
import { Roles } from '../decorators/roles.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
@ApiTags('Clients')
@Controller('api/v1/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getCurrentClient(@CurrentUser() payload: JWTPayLoadType) {
    return this.clientsService.getClientByUserId(payload.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getAllClients(@Query() query: any) {
    return this.clientsService.getAllClients(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getClientById(@Param('id',ParseIntPipe) id: number) {
    return this.clientsService.getClientById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async deleteClient(@Param('id',ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.clientsService.deleteClient(id,payload);
  }
  
}