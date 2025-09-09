import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectsService } from './project.service';
import { Project } from './entities/project.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { ClientsService } from '../users/clients/clients.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ApiFeatures } from '../../utils/apiFeature/api-features.postgres';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: Repository<Project>;
  let countryRepository: Repository<Country>;
  let serviceRepository: Repository<Service>;
  let clientsService: ClientsService;
  let factory: HandlerFactory<Project>;

  const mockProjectRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    metadata: {
      relations: []
    }
  };

  const mockCountryRepository = {
    findOne: jest.fn(),
    find: jest.fn()
  };

  const mockServiceRepository = {
    find: jest.fn(),
    findOne: jest.fn()
  };

  const mockClientsService = {
    getClientByUserId: jest.fn()
  };

  const mockFactory = {
    create: jest.fn(),
    getOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    // Add more SelectQueryBuilder properties as needed
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    rightJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getSql: jest.fn(),
    getParameters: jest.fn(),
    setParameter: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    cache: jest.fn().mockReturnThis(),
    useTransaction: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOneOrFail: jest.fn(),
    getManyAndCount: jest.fn(),
    getManyAndCountRaw: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    getRawAndEntities: jest.fn(),
    stream: jest.fn(),
    expressionMap: {
      joinAttributes: []
    }
  } as any;

  const mockApiFeatures = {
    filter: jest.fn().mockReturnThis(),
    search: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    paginate: jest.fn().mockReturnValue({
      queryBuilder: mockQueryBuilder,
      pagination: { page: 1, limit: 10, total: 1 }
    }),
    getQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    hasJoin: jest.fn().mockReturnThis(),
    ensureCountryJoin: jest.fn().mockReturnThis(),
    queryBuilder: mockQueryBuilder,
    queryParams: {},
    resourceName: 'Project',
    alias: 'project',
    pagination: { page: 1, limit: 10, total: 1 }
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.CLIENT,
    sessionId: 1
  };

  const mockAdminPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository
        },
        {
          provide: ClientsService,
          useValue: mockClientsService
        }
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    countryRepository = module.get<Repository<Country>>(getRepositoryToken(Country));
    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));
    clientsService = module.get<ClientsService>(ClientsService);
    
    // Mock the factory
    service['factory'] = mockFactory as any;
    
    // Mock ApiFeatures
    jest.spyOn(ApiFeatures.prototype, 'filter').mockReturnValue(mockApiFeatures as any);
    jest.spyOn(ApiFeatures.prototype, 'search').mockReturnValue(mockApiFeatures as any);
    jest.spyOn(ApiFeatures.prototype, 'sort').mockReturnValue(mockApiFeatures as any);
    jest.spyOn(ApiFeatures.prototype, 'paginate').mockReturnValue({
      queryBuilder: mockQueryBuilder,
      pagination: { page: 1, limit: 10, total: 1 }
    });
    jest.spyOn(ApiFeatures.prototype, 'getQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    const createDto: CreateProjectDto = {
      title: 'Test Project',
      description: 'Test description',
      countryId: 1,
      services_needed: [1, 2],
      budget: 5000
    };

    const mockCountry = { id: 1, name: 'Egypt' };
    const mockServices = [
      { id: 1, name: 'Service 1' },
      { id: 2, name: 'Service 2' }
    ];
    const mockClient = { id: 1, userId: 1 };
    const mockProject = { id: 1, ...createDto, clientId: 1 };

    it('should create project successfully', async () => {
      mockCountryRepository.findOne.mockResolvedValue(mockCountry);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockProjectRepository.findOne.mockResolvedValue(null);
      mockClientsService.getClientByUserId.mockResolvedValue(mockClient);
      mockProjectRepository.create.mockReturnValue(mockProject);
      mockFactory.create.mockResolvedValue(mockProject);

      const result = await service.createProject(createDto, mockPayload);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Project Created Successfully');
      expect(result.data).toEqual(mockProject);
      expect(mockCountryRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.countryId } });
      expect(mockServiceRepository.find).toHaveBeenCalledWith({ where: { id: In(createDto.services_needed) } });
      expect(mockClientsService.getClientByUserId).toHaveBeenCalledWith(mockPayload.id);
    });

    it('should throw NotFoundException for invalid country', async () => {
      mockCountryRepository.findOne.mockResolvedValue(null);

      await expect(service.createProject(createDto, mockPayload))
        .rejects.toThrow(`Country ID ${createDto.countryId} not found`);
    });

    it('should throw BadRequestException for invalid services', async () => {
      mockCountryRepository.findOne.mockResolvedValue(mockCountry);
      mockServiceRepository.find.mockResolvedValue([{ id: 1, name: 'Service 1' }]);

      await expect(service.createProject(createDto, mockPayload))
        .rejects.toThrow('One or more services_needed are invalid');
    });

    it('should throw BadRequestException for duplicate title', async () => {
      mockCountryRepository.findOne.mockResolvedValue(mockCountry);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      await expect(service.createProject(createDto, mockPayload))
        .rejects.toThrow('Project with this title already exists');
    });
  });

  // describe('getAllProjects', () => {
  //   it('should return projects for client user', async () => {
  //     const mockClient = { id: 1, userId: 1 };
  //     const mockProjects = [{ id: 1, title: 'Test Project', clientId: 1 }];

  //     mockClientsService.getClientByUserId.mockResolvedValue(mockClient);
  //     mockProjectRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  //     mockQueryBuilder.getCount.mockResolvedValue(1);
  //     mockQueryBuilder.getMany.mockResolvedValue(mockProjects);

  //     const result = await service.getAllProjects(mockPayload, {});

  //     expect(result.status).toBe('success');
  //     expect(result.message).toBe('Projects retrieved successfully');
  //     expect(Array.isArray(result.data)).toBe(true);
  //     expect(result.pagination).toBeDefined();
  //     expect(mockClientsService.getClientByUserId).toHaveBeenCalledWith(mockPayload.id);
  //   });

  //   it('should return all projects for admin user', async () => {
  //     const mockProjects = [{ id: 1, title: 'Test Project' }];

  //     mockProjectRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  //     mockQueryBuilder.getCount.mockResolvedValue(1);
  //     mockQueryBuilder.getMany.mockResolvedValue(mockProjects);

  //     const result = await service.getAllProjects(mockAdminPayload, {});

  //     expect(result.status).toBe('success');
  //     expect(result.message).toBe('Projects retrieved successfully');
  //     expect(Array.isArray(result.data)).toBe(true);
  //     expect(mockClientsService.getClientByUserId).not.toHaveBeenCalled();
  //   });
  // });

  describe('getProjectById', () => {
    it('should return project by id', async () => {
      const mockProject = { id: 1, title: 'Test Project' };
      mockFactory.getOne.mockResolvedValue(mockProject);

      const result = await service.getProjectById(1, mockPayload);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Project Retrieved Successfully');
      expect(result.data).toEqual(mockProject);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getProjectByIdWithRelations', () => {
    it('should return project with relations', async () => {
      const mockProject = { id: 1, title: 'Test Project', client: {}, country: {} };
      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.getProjectByIdWithRelations(1, mockPayload);

      expect(result).toEqual(mockProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['client', 'client.user']
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.getProjectByIdWithRelations(1, mockPayload))
        .rejects.toThrow('Project with ID 1 not found');
    });
  });

  describe('getProjectByIdWithRelationsInternal', () => {
    it('should return project with relations for internal use', async () => {
      const mockProject = { id: 1, title: 'Test Project', client: {}, country: {} };
      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.getProjectByIdWithRelationsInternal(1);

      expect(result).toEqual(mockProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['client', 'client.user']
      });
    });
  });

  describe('updateProject', () => {
    const updateDto: UpdateProjectDto = {
      title: 'Updated Project',
      countryId: 2
    };

    it('should update project successfully', async () => {
      const mockCountry = { id: 2, name: 'Updated Country' };
      const mockUpdatedProject = { id: 1, ...updateDto };

      mockCountryRepository.findOne.mockResolvedValue(mockCountry);
      mockFactory.updateOne.mockResolvedValue(mockUpdatedProject);

      const result = await service.updateProject(1, updateDto, mockPayload);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Project with id 1 Updated Successfully');
      expect(result.data).toEqual(mockUpdatedProject);
      expect(mockCountryRepository.findOne).toHaveBeenCalledWith({ where: { id: updateDto.countryId } });
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException for invalid country', async () => {
      mockCountryRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProject(1, updateDto, mockPayload))
        .rejects.toThrow(`Country ID ${updateDto.countryId} not found`);
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const mockProject = { id: 1, title: 'Test Project' };
      const deleteResult = { message: 'Deleted', data: mockProject };

      mockFactory.getOne.mockResolvedValue(mockProject);
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteProject(1, mockPayload);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Deleted');
      expect(result.data).toEqual(mockProject);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
