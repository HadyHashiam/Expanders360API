import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendor.controller';
import { VendorsService } from './vendor.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';

describe('VendorController', () => {
  let controller: VendorsController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        {
          provide: VendorsService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VendorsController>(VendorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});


