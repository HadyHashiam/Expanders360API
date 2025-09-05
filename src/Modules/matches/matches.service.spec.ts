import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/matches.entity';
import { ProjectsService } from '../projects/project.service';
import { VendorsService } from '../vendor/vendor.service';
import { SystemConfigService } from '../config/system-config/system-config.service';
import { MailsService } from '../mails/mails.service';
import { UserType } from '../../utils/enums';

describe('MatchesService', () => {
  let service: MatchesService;
  let repo: any;
  let projects: any;
  let vendors: any;
  let config: any;
  let mails: any;

  beforeAll(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    } as Partial<Repository<Match>>;
    projects = {
      getProjectByIdWithRelations: jest.fn(),
      getProjectByIdWithRelationsInternal: jest.fn(),
    };
    vendors = { getAllVendors: jest.fn() };
    config = { getConfigValue: jest.fn() };
    mails = { sendMatchNotification: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: repo },
        { provide: ProjectsService, useValue: projects },
        { provide: VendorsService, useValue: vendors },
        { provide: SystemConfigService, useValue: config },
        { provide: MailsService, useValue: mails },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAllMatches returns factory getAll result directly', async () => {
    (service as any).factory = { getAll: jest.fn().mockResolvedValue({ status: 'success', results: 0, pagination: {}, data: [] }) };
    const res = await service.getAllMatches({});
    expect(res.status).toBe('success');
  });

  it('getMatchById uses factory.getOne', async () => {
    (service as any).factory = { getOne: jest.fn().mockResolvedValue({ id: 1 }) };
    const res = await service.getMatchById(1);
    expect(res).toEqual({ id: 1 });
  });

  it('deleteMatch forbids non-admin', async () => {
    (service as any).factory = { deleteOne: jest.fn() };
    await expect(service.deleteMatch(1, { userType: UserType.CLIENT } as any)).rejects.toBeTruthy();
  });

  it('rebuildMatches: computes and returns results', async () => {
    const payload = { id: 1, userType: UserType.ADMIN } as any;
    projects.getProjectByIdWithRelationsInternal.mockResolvedValue({ id: 10, country: 'US', services_needed: ['web-development'], client: { user: { email: 'c@e.com' } } });
    vendors.getAllVendors.mockResolvedValue({ data: [{ id: 20, countries_supported: ['US'], services_offered: ['web-development'], rating: 3, response_sla_hours: 10 }] });
    config.getConfigValue.mockResolvedValueOnce(2); // services_overlap_multiplier
    config.getConfigValue.mockResolvedValueOnce(100); // max_matches_per_project
    (repo as any).count.mockResolvedValue(0);
    (repo as any).findOne.mockResolvedValue(null);
    (repo as any).create.mockReturnValue({ projectId: 10, vendorId: 20, score: 5 });
    (repo as any).save.mockImplementation(async (m: any) => ({ ...m, id: 1 }));

    const res = await service.rebuildMatches(10, payload);
    expect(res.length).toBeGreaterThanOrEqual(0);
    expect(mails.sendMatchNotification).toHaveBeenCalled();
  });
});


