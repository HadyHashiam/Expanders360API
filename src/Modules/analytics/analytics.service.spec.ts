import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/matches.entity';
import { Project } from '../projects/entities/project.entity';
import { VendorsService } from '../vendor/vendor.service';
import { ProjectsService } from '../projects/project.service';
import { DocumentsService } from '../documents/documents.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let matchRepo: any;
  let projectRepo: any;

  beforeAll(async () => {
    matchRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: () => ({ addSelect: () => ({ addSelect: () => ({ addSelect: () => ({ innerJoin: () => ({ innerJoin: () => ({ where: () => ({ groupBy: () => ({ orderBy: () => ({ getRawMany: jest.fn().mockResolvedValue([]) }) }) }) }) }) }) }) }) }),
      }),
    };
    projectRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({ where: () => ({ getMany: jest.fn().mockResolvedValue([]) }) }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Match), useValue: matchRepo as Partial<Repository<Match>> },
        { provide: getRepositoryToken(Project), useValue: projectRepo as Partial<Repository<Project>> },
        { provide: VendorsService, useValue: {} },
        { provide: ProjectsService, useValue: {} },
        { provide: DocumentsService, useValue: {} },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


