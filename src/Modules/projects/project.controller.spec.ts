import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './project.controller';
import { ProjectsService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { OwnerGuard } from '../users/guards/owner.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    createProject: jest.fn(),
    getAllProjects: jest.fn(),
    getProjectById: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn()
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
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(OwnerGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProject', () => {
    it('should create project', async () => {
      const createDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test description',
        countryId: 1,
        services_needed: [1, 2],
        budget: 5000
      };

      const expectedResult = {
        status: 'success',
        data: { id: 1, ...createDto },
        message: 'Project Created Successfully'
      };

      mockProjectsService.createProject.mockResolvedValue(expectedResult);

      const result = await controller.createProject(createDto, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockProjectsService.createProject).toHaveBeenCalledWith(createDto, mockPayload);
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects for admin', async () => {
      const queryParams = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        message: 'Projects retrieved successfully',
        results: 1,
        pagination: { page: 1, limit: 10, total: 1 },
        data: [{ id: 1, title: 'Test Project' }]
      };

      mockProjectsService.getAllProjects.mockResolvedValue(expectedResult);

      const result = await controller.getAllProjects(mockAdminPayload, queryParams);

      expect(result).toEqual(expectedResult);
      expect(mockProjectsService.getAllProjects).toHaveBeenCalledWith(mockAdminPayload, queryParams);
    });
  });

  describe('getProjectById', () => {
    it('should return project by id', async () => {
      const projectId = 1;
      const expectedResult = {
        status: 'success',
        data: { id: 1, title: 'Test Project' },
        message: 'Project Retrieved Successfully'
      };

      mockProjectsService.getProjectById.mockResolvedValue(expectedResult);

      const result = await controller.getProjectById(projectId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockProjectsService.getProjectById).toHaveBeenCalledWith(projectId, mockPayload);
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      const projectId = 1;
      const updateDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated description'
      };

      const expectedResult = {
        status: 'success',
        message: 'Project with id 1 Updated Successfully',
        data: { id: 1, ...updateDto }
      };

      mockProjectsService.updateProject.mockResolvedValue(expectedResult);

      const result = await controller.updateProject(projectId, updateDto, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockProjectsService.updateProject).toHaveBeenCalledWith(projectId, updateDto, mockPayload);
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      const projectId = 1;
      const expectedResult = {
        status: 'success',
        message: 'Deleted',
        data: { id: 1, title: 'Test Project' }
      };

      mockProjectsService.deleteProject.mockResolvedValue(expectedResult);

      const result = await controller.deleteProject(projectId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockProjectsService.deleteProject).toHaveBeenCalledWith(projectId, mockPayload);
    });
  });
});
