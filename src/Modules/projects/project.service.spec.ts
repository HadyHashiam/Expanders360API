import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ClientsService } from '../users/clients/clients.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepo: any;
  let clientsService: any;

  beforeAll(async () => {
    projectRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    clientsService = {
      getClientByUserId: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectRepo as Partial<Repository<Project>> },
        { provide: ClientsService, useValue: clientsService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createProject: creates when no duplicate title', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    clientsService.getClientByUserId.mockResolvedValue({ id: 2 });
    const dto: any = { title: 'New Title', description: 'd' };
    const created = { id: 1, title: 'new title', description: 'd', clientId: 2 };
    projectRepo.create.mockReturnValue(created);
    (service as any).factory = { create: jest.fn().mockResolvedValue(created) };

    const result = await service.createProject(dto, { id: 5 } as any);
    expect(projectRepo.findOne).toHaveBeenCalled();
    expect(clientsService.getClientByUserId).toHaveBeenCalledWith(5);
    expect((service as any).factory.create).toHaveBeenCalled();
    expect(result.status).toBe('success');
    expect(result.data).toEqual(created);
  });

  it('updateProject: returns success payload', async () => {
    (service as any).factory = {
      updateOne: jest.fn().mockResolvedValue({ id: 10 }),
    } as any;
    jest.spyOn(service, 'getProjectById').mockResolvedValue({ id: 10 } as any);
    const res = await service.updateProject(10, { description: 'd' } as any, { id: 1 } as any);
    expect(res.status).toBe('success');
    expect(res.data).toEqual({ id: 10 });
  });

  it('deleteProject: returns success payload', async () => {
    (service as any).factory = {
      deleteOne: jest.fn().mockResolvedValue({ message: 'Project Deleted Successfully' }),
    } as any;
    jest.spyOn(service, 'getProjectById').mockResolvedValue({ id: 11 } as any);
    const res = await service.deleteProject(11, { id: 1 } as any);
    expect(res.status).toBe('success');
    expect(res.message).toContain('Deleted');
  });
});


