import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { UserType } from '../../utils/enums';
import { PaginationMeta } from '../../utils/types/api-response.types';
import { JWTPayLoadType } from '../../utils/types/types';
import { ClientsService } from '../users/clients/clients.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ApiFeatures } from '../../utils/apiFeature/api-features.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';
import { ProjectWithNamesDto } from './dto/project-response.dto';


@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private factory: HandlerFactory<Project>;

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly clientsService: ClientsService,
  ) {
    this.factory = new HandlerFactory<Project>(this.projectRepository);
  }

  /**
   * Creates a new project after checking for duplicate titles
   */
  public async createProject(createProjectDto: CreateProjectDto, payload: JWTPayLoadType): Promise<{ status: string; data: any; message: string }> {
    try {
      // countryId exists
      const country = await this.countryRepository.findOne({ where: { id: createProjectDto.countryId } });
      if (!country) {
        throw new NotFoundException(`Country ID ${createProjectDto.countryId} not found`);
      }

      // services_needed exist
      if (createProjectDto.services_needed?.length) {
        const services = await this.serviceRepository.find({ where: { id: In(createProjectDto.services_needed) } });
        if (services.length !== createProjectDto.services_needed.length) {
          throw new BadRequestException('One or more services_needed are invalid');
        }
      }

      // duplicate title (case-insensitive)
      const existingProject = await this.projectRepository.findOne({ where: { title: createProjectDto.title.toLowerCase() } });
      if (existingProject) {
        this.logger.warn(`Attempt to create project with duplicate title: ${createProjectDto.title}`);
        throw new BadRequestException('Project with this title already exists');
      }

      const client = await this.clientsService.getClientByUserId(payload.id);
      const project = this.projectRepository.create({
        ...createProjectDto,
        title: createProjectDto.title.toLowerCase(),
        clientId: client.id,
      });
      const result = await this.factory.create(project);
      return { status: 'success', data: result, message: 'Project Created Successfully'};
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  /**
   * Retrieves all projects with optional filtering and pagination
   */
  async getAllProjects(
    payload: JWTPayLoadType,
    queryParams: any,
  ): Promise<{ status: string; message: string; results: number; pagination: PaginationMeta; data: ProjectWithNamesDto[] }> {
    let queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.country', 'country')
      // .leftJoinAndSelect('client.user', 'user');

    if (payload.userType !== UserType.ADMIN) {
      const client = await this.clientsService.getClientByUserId(payload.id);
      queryBuilder = queryBuilder.where('project.clientId = :clientId', { clientId: client.id });
    }

    const apiFeatures = new ApiFeatures(
      queryBuilder,
      queryParams,
      Resource_Name.PROJECTS,
      Models_Name.PROJECT
    );
    
    const filteredQuery = apiFeatures.filter().search().sort();
    const totalCount = await filteredQuery.getQueryBuilder().getCount();
    const { queryBuilder: paginatedQuery, pagination } = apiFeatures.paginate(totalCount);
    
    const data = await paginatedQuery.getMany();
    
    const projectsWithNames = await this.transformProjectsWithNames(data);
    
    return {
      status: 'success',
      message: 'Projects retrieved successfully',
      results: projectsWithNames.length,
      pagination,
      data: projectsWithNames,
    };
  }

  /**
   * Transform projects to include country and service names
   * Comment this function to disable enhanced response
   */
  private async transformProjectsWithNames(projects: Project[]): Promise<ProjectWithNamesDto[]> {
    const allServiceIds = [...new Set(projects.flatMap(p => p.services_needed))];
    const services = await this.serviceRepository.find({ where: { id: In(allServiceIds) } });
    const serviceMap = new Map(services.map(s => [s.id, s.name]));

    return projects.map(project => ({
      ...project,
      // country_name: project.country?.name || `Unknown Country ${project.countryId}`,
      services_needed_names: project.services_needed.map(id => serviceMap.get(id) || `Unknown Service ${id}`)
    }));
  }

  public async getProjectById(id: number, payload: JWTPayLoadType):Promise<{ status: string; data: Project ,message:string }> {
    const result = await this.factory.getOne(id);
    return { status: 'success', data: result, message: 'Project Retrieved Successfully'};
  }

  public async getProjectByIdWithRelations(id: number, payload: JWTPayLoadType): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id }, relations: ['client', 'client.user'] });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  public async getProjectByIdWithRelationsInternal(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id }, relations: ['client', 'client.user'] });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  public async updateProject(id: number, updateProjectDto: UpdateProjectDto, payload: JWTPayLoadType): Promise<{status:string , message: string , data:Project}> {
    try {
      if (updateProjectDto.countryId) {
        const country = await this.countryRepository.findOne({ where: { id: updateProjectDto.countryId } });
        if (!country) {
          throw new NotFoundException(`Country ID ${updateProjectDto.countryId} not found`);
        }
      }
      if (updateProjectDto.services_needed?.length) {
        const services = await this.serviceRepository.find({ where: { id: In(updateProjectDto.services_needed) } });
        if (services.length !== updateProjectDto.services_needed.length) {
          throw new BadRequestException('One or more services_needed are invalid');
        }
      }
      const updatedDoc = await this.factory.updateOne(id, updateProjectDto);
      return { status: 'success', message: `Project with id ${updatedDoc.id} Updated Successfully`, data: updatedDoc};
    } catch (error) {
      this.logger.error(`Failed to update project ID ${id}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  public async deleteProject(id: number, payload: JWTPayLoadType): Promise<{status:string, message: string ,data:Project}> {
    const project = await this.getProjectById(id, payload);
    const result = await this.factory.deleteOne(id);
    return { status: 'success',  message: `Deleted`,data: result.data}
  }
}