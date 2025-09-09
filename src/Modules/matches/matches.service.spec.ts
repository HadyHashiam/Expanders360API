import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchesService } from './matches.service';
import { Match } from './entities/matches.entity';
import { ProjectsService } from '../projects/project.service';
import { VendorsService } from '../vendor/vendor.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { MailsService } from '../mails/mails.service';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';

describe('MatchesService', () => {
  let service: MatchesService;
  let repository: Repository<Match>;
  let projectsService: ProjectsService;
  let vendorsService: VendorsService;
  let systemConfigService: SystemConfigService;
  let mailsService: MailsService;
  let factory: HandlerFactory<Match>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    metadata: {
      relations: []
    }
  };

  const mockFactory = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };

  const mockProjectsService = {
    getProjectByIdWithRelations: jest.fn(),
    getProjectByIdWithRelationsInternal: jest.fn()
  };

  const mockVendorsService = {
    getAllVendors: jest.fn()
  };

  const mockSystemConfigService = {
    getConfigValue: jest.fn()
  };

  const mockMailsService = {
    sendMatchNotification: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(Match),
          useValue: mockRepository
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService
        },
        {
          provide: VendorsService,
          useValue: mockVendorsService
        },
        {
          provide: SystemConfigService,
          useValue: mockSystemConfigService
        },
        {
          provide: MailsService,
          useValue: mockMailsService
        }
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    repository = module.get<Repository<Match>>(getRepositoryToken(Match));
    projectsService = module.get<ProjectsService>(ProjectsService);
    vendorsService = module.get<VendorsService>(VendorsService);
    systemConfigService = module.get<SystemConfigService>(SystemConfigService);
    mailsService = module.get<MailsService>(MailsService);
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllMatches', () => {
    it('getAllMatches returns unified paginated shape', async () => {
      const mockResult = {
        data: [{ id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllMatches({});

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.MATCHES, Models_Name.MATCH);
    });
  });

  describe('getAllMatchesForProject', () => {
    it('should return matches for specific project', async () => {
      const mockResult = {
        data: [{ id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllMatchesForProject(1, {});

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({ projectId: 1 }, Resource_Name.MATCHES, Models_Name.MATCH);
    });
  });

  describe('getProjectMatches', () => {
    it('should return project matches for admin', async () => {
      const mockProject = { id: 1, name: 'Test Project' };
      const mockMatches = [
        { id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 },
        { id: 2, projectId: 1, vendorId: 2, countryId: 1, score: 75.0 }
      ];

      mockProjectsService.getProjectByIdWithRelationsInternal.mockResolvedValue(mockProject);
      mockRepository.find.mockResolvedValue(mockMatches);

      const result = await service.getProjectMatches(1, mockPayload);

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMatches);
      expect(mockProjectsService.getProjectByIdWithRelationsInternal).toHaveBeenCalledWith(1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { projectId: 1 },
        order: { score: 'DESC' },
        relations: ['vendor', 'project']
      });
    });

    it('should return project matches for client', async () => {
      const clientPayload = { ...mockPayload, userType: UserType.CLIENT };
      const mockProject = { id: 1, name: 'Test Project' };
      const mockMatches = [{ id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 }];

      mockProjectsService.getProjectByIdWithRelations.mockResolvedValue(mockProject);
      mockRepository.find.mockResolvedValue(mockMatches);

      const result = await service.getProjectMatches(1, clientPayload);

      expect(result.status).toBe('success');
      expect(mockProjectsService.getProjectByIdWithRelations).toHaveBeenCalledWith(1, clientPayload);
    });
  });

  describe('getMatchById', () => {
    it('should return match by id', async () => {
      const mockMatch = { id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 };
      mockFactory.getOne.mockResolvedValue(mockMatch);

      const result = await service.getMatchById(1);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockMatch);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteMatch', () => {
    it('should delete match successfully for admin', async () => {
      const deleteResult = { message: 'Match deleted successfully', data: {}, status: 'success' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteMatch(1, mockPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const clientPayload = { ...mockPayload, userType: UserType.CLIENT };

      await expect(service.deleteMatch(1, clientPayload))
        .rejects.toThrow('Only admins can delete matches');
    });
  });

  describe('rebuildMatches', () => {
    const mockProject = {
      id: 1,
      name: 'Test Project',
      countryId: 1,
      services_needed: [1, 2],
      client: { user: { email: 'client@test.com' } }
    };

    const mockVendors = [
      {
        id: 1,
        name: 'Vendor 1',
        countries_supported: [1],
        services_offered: [1, 2],
        rating: 4.5,
        response_sla_hours: 24
      }
    ];

    beforeEach(() => {
      mockProjectsService.getProjectByIdWithRelationsInternal.mockResolvedValue(mockProject);
      mockVendorsService.getAllVendors.mockResolvedValue({ data: mockVendors });
      mockSystemConfigService.getConfigValue.mockImplementation((key, defaultValue) => {
        if (key === 'services_overlap_multiplier') return 2;
        if (key === 'max_matches_per_project') return 10000;
        return defaultValue;
      });
      mockRepository.count.mockResolvedValue(0);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 });
      mockRepository.save.mockResolvedValue({ id: 1, projectId: 1, vendorId: 1, countryId: 1, score: 85.5 });
    });

    it('should rebuild matches successfully', async () => {
      const result = await service.rebuildMatches(1, mockPayload);

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('matches');
      expect(result.data).toHaveProperty('totalMatchesCount');
      expect(mockProjectsService.getProjectByIdWithRelationsInternal).toHaveBeenCalledWith(1);
      expect(mockVendorsService.getAllVendors).toHaveBeenCalledWith({});
    });

    it('should send notification when new matches are created', async () => {
      await service.rebuildMatches(1, mockPayload);

      expect(mockMailsService.sendMatchNotification).toHaveBeenCalledWith(
        'client@test.com',
        1,
        1,
        1
      );
    });
  });
});
