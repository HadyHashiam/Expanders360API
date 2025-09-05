import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types';
import { ClientsService } from '../users/clients/clients.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { HandlerFactory } from '../../utils/handlerfactory/handler-factory.postgres';
import { ApiFeatures } from '../../utils/apifeature/api-features.postgres';


@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private factory: HandlerFactory<Project>;

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly clientsService: ClientsService,
  ) {
    this.factory = new HandlerFactory<Project>(this.projectRepository);
  }

  /**
   * Creates a new project after checking for duplicate titles
   * @param createProjectDto - The project creation data
   * @param payload - JWT payload containing user information
   * @returns The created project
   * @throws BadRequestException if a project with the same title already exists
   */
  public async createProject(createProjectDto: CreateProjectDto, payload: JWTPayLoadType): Promise<{ status: string; data: any; message: string }> {
    // Check for duplicate project title (case-insensitive)
    const existingProject = await this.projectRepository.findOne({
      where: { title: createProjectDto.title.toLowerCase() }
    });
    
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
        return { status: 'success', data: result, message: 'Project Created Sucssefully'};
  }

  //   async getAllProjects(query: any, req?: Request): Promise<{ status: string; results: number; pagination: any; data: Project[] }> {
//   const result = await this.factory.getAll(query, 'projects', 'project');
//   // return { result : result.data };
//    return { status: 'success', results: result.length, pagination: result.pagination, data :result.data };
// }


  /**
   * Retrieves all projects with optional filtering and pagination
   * @param payload - JWT payload containing user information
   * @param queryParams - Query parameters for filtering, searching, sorting, and pagination
   * @returns Paginated list of projects
   */
 async getAllProjects(payload: JWTPayLoadType, queryParams: any): Promise<{ status: string; results: number; pagination: any; data: Project[] }> {
    let queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('client.user', 'user');

    if (payload.userType !== UserType.ADMIN) {
      const client = await this.clientsService.getClientByUserId(payload.id);
      queryBuilder = queryBuilder.where('project.clientId = :clientId', { clientId: client.id });
    }

    // Apply API features (filter, search, sort, pagination)
    const apiFeatures = new ApiFeatures(
      queryBuilder,
      queryParams,
      'projects',
      'project'
    );
    
    const filteredQuery = apiFeatures.filter().search().sort();
    const totalCount = await filteredQuery.getQueryBuilder().getCount();
    const { queryBuilder: paginatedQuery, pagination } = apiFeatures.paginate(totalCount);
    
    const data = await paginatedQuery.getMany();
    return { status: 'success', results: data.length, pagination, data };
  }

  /**
   * Retrieves a project by ID without ownership validation (for internal use)
   * @param id - The project ID
   * @returns The project with client and user relations
   * @throws NotFoundException if project is not found
   */
  public async getProjectById(id: number, payload: JWTPayLoadType): Promise<Project> {
    const project = await this.factory.getOne(id);
    return project;
  }

  /**
   * Retrieves a project by ID with relations, without ownership validation (for internal use)
   * @param id - The project ID
   * @returns The project with client and user relations
   * @throws NotFoundException if project is not found
   */
  public async getProjectByIdWithRelations(id: number, payload: JWTPayLoadType): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client', 'client.user'],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  /**
   * Retrieves a project by ID with relations for internal use (no permission checks)
   * @param id - The project ID
   * @returns The project with client and user relations
   * @throws NotFoundException if project is not found
   */
  public async getProjectByIdWithRelationsInternal(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client', 'client.user'],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  /**
   * Updates a project by ID
   * @param id - The project ID
   * @param updateProjectDto - The update data
   * @param payload - JWT payload containing user information
   * @returns The updated project
   */
  public async updateProject(id: number, updateProjectDto: UpdateProjectDto, payload: JWTPayLoadType): Promise<{status:string , message: string , data:Project}> {
    const project = await this.getProjectById(id, payload);
    Object.assign(project, updateProjectDto);
    const updatedDoc = await  this.factory.updateOne(id, project);
    return { status: 'success',  message: `Project with id ${updatedDoc.id} Updated Successfully`,data: updatedDoc}
  }

  /**
   * Deletes a project by IDss
   * @param id - The project ID
   * @param payload - JWT payload containing user information
   * @returns Success message
   */
  public async deleteProject(id: number, payload: JWTPayLoadType): Promise<{status:string, message: string ,data:Project}> {
    const project = await this.getProjectById(id, payload);
    const deletedDoc = await this.factory.deleteOne(id);
    return {status:"success" , message:"Project Deleted Successfully" , data:project }
  }
}