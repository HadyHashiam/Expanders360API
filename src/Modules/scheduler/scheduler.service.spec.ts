import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { MatchesService } from '../matches/matches.service';
import { ProjectsService } from '../projects/project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/matches.entity';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let matchesService: any;
  let projectsService: any;
  let matchRepo: any;

  beforeAll(async () => {
    matchesService = { rebuildMatches: jest.fn() };
    projectsService = { getAllProjects: jest.fn() };
    matchRepo = { find: jest.fn(), save: jest.fn() } as Partial<Repository<Match>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: MatchesService, useValue: matchesService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: getRepositoryToken(Match), useValue: matchRepo },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('refreshMatchesJob: processes active projects', async () => {
    projectsService.getAllProjects.mockResolvedValue({ data: [{ id: 1, status: 'active' }] });
    matchesService.rebuildMatches.mockResolvedValue({ length: 1, totalMatchesCount: 1, matches: [] });
    await service.refreshMatchesJob();
    expect(matchesService.rebuildMatches).toHaveBeenCalled();
  });

  it('flagExpiredSLAsJob: flags expired matches', async () => {
    const past = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5h ago
    matchRepo.find.mockResolvedValue([
      { id: 1, projectId: 1, vendorId: 1, notifiedAt: past, is_sla_expired: false, vendor: { response_sla_hours: 1 } },
    ]);
    matchRepo.save.mockResolvedValue({});
    await service.flagExpiredSLAsJob();
    expect(matchRepo.save).toHaveBeenCalled();
  });
});


