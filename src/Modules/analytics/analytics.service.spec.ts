import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { DocumentsService } from '../documents/documents.service';
import { Match } from '../matches/entities/matches.entity';
import { Project } from '../projects/entities/project.entity';
import { Country } from '../countries/entities/country.entity';
import { ProjectStatus } from '../../utils/enums';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let matchRepository: Repository<Match>;
  let projectRepository: Repository<Project>;
  let countryRepository: Repository<Country>;
  let documentsService: DocumentsService;

  const mockMatchRepository = {
    createQueryBuilder: jest.fn()
  };

  const mockProjectRepository = {
    createQueryBuilder: jest.fn()
  };

  const mockCountryRepository = {
    find: jest.fn(),
    findOne: jest.fn()
  };

  const mockDocumentsService = {
    countDocumentsByProjectIds: jest.fn()
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository
        },
        {
          provide: DocumentsService,
          useValue: mockDocumentsService
        }
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    countryRepository = module.get<Repository<Country>>(getRepositoryToken(Country));
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopVendors', () => {
    it('should return top vendors analytics successfully', async () => {
      const mockTopVendors = [
        {
          vendorId: 1,
          vendorName: 'Vendor 1',
          country: 'Egypt',
          avgScore: '85.50'
        },
        {
          vendorId: 2,
          vendorName: 'Vendor 2',
          country: 'Egypt',
          avgScore: '80.25'
        }
      ];

      const mockExpansionProjects = [
        {
          id: 1,
          country: { name: 'Egypt' }
        },
        {
          id: 2,
          country: { name: 'Egypt' }
        }
      ];

      mockMatchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockTopVendors);

      mockProjectRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockExpansionProjects);

      mockDocumentsService.countDocumentsByProjectIds.mockResolvedValue(5);

      const result = await service.getTopVendors();

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty('country');
      expect(result.data[0]).toHaveProperty('topVendors');
      expect(result.data[0]).toHaveProperty('expansionDocumentsCount');
      expect(mockMatchRepository.createQueryBuilder).toHaveBeenCalledWith('match');
      expect(mockProjectRepository.createQueryBuilder).toHaveBeenCalledWith('project');
    });

    it('should handle empty results gracefully', async () => {
      mockMatchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      mockProjectRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getTopVendors();

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockMatchRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.getTopVendors()).rejects.toThrow('Failed to fetch top vendors');
    });
  });
});

