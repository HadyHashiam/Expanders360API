import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, UsePipes, Query, ParseIntPipe } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { CurrentUser } from '../users/decorators/user.decorator';
import { JWTPayLoadType } from '../../utils/types/types';
import { ProjectsService } from './project.service';
import { RestrictToOwner } from '../users/decorators/restrict-to-owner.decorator';
import { OwnerGuard } from '../users/guards/owner.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  // POST /api/v1/projects
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiSecurity('bearer')
  public async createProject(@Body() body: CreateProjectDto, @CurrentUser() payload: JWTPayLoadType) {
    return this.projectsService.createProject(body, payload);
  }

  // GET /api/v1/projects
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK) //200
  @ApiSecurity('bearer')
  async getAllProjects(@CurrentUser() payload: JWTPayLoadType, @Query() queryParams: any) {
    return this.projectsService.getAllProjects(payload, queryParams);
  }
  
  // GET /api/v1/projects/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @RestrictToOwner('Project')
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async getProjectById(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.projectsService.getProjectById(id, payload);
  }

 // PATCH /api/v1/projects/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @RestrictToOwner('Project')
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProjectDto,
    @CurrentUser() payload: JWTPayLoadType,
  ) {
    return this.projectsService.updateProject(id, body, payload);
  }

  // DELETE /api/v1/projects/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @RestrictToOwner('Project')
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async deleteProject(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayLoadType) {
    return this.projectsService.deleteProject(id, payload);
  }
}