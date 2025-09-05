import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './project.controller';
import { ProjectsService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { OwnerGuard } from '../users/guards/owner.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});


