import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../../auth/guards/RolesGuard';

describe('SystemConfigController', () => {
  let controller: SystemConfigController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigController],
      providers: [
        { provide: SystemConfigService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SystemConfigController>(SystemConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});


