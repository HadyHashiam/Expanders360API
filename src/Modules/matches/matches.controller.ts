import { Controller, Post, Param, HttpCode, HttpStatus, UseGuards, ParseIntPipe, Get, Query, Delete } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { CurrentUser } from '../users/decorators/user.decorator';
import { JWTPayLoadType } from '../../utils/types/types';
import { RestrictToOwner } from '../users/decorators/restrict-to-owner.decorator';
import { OwnerGuard } from '../users/guards/owner.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Matches')
@Controller('api/v1/projects/:id/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('rebuild')
  @UseGuards(JwtAuthGuard, RolesGuard,OwnerGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @RestrictToOwner('Project')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async rebuildMatches(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.matchesService.rebuildMatches(id, payload);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  async getAllMatches(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.matchesService.getAllMatchesForProject(id, query);
  }

  @Get('match/:matchId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getMatchById(@Param('matchId', ParseIntPipe) id: number) {
    return this.matchesService.getMatchById(id);
  }

  @Delete('match/:matchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async deleteMatch(@Param('matchId', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.matchesService.deleteMatch(id, payload);
  }
}
