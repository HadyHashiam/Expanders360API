import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getTopVendors: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTopVendors', () => {
    it('should return top vendors analytics', async () => {
      const expectedResult = {
        status: 'success',
        data: [
          {
            country: 'Egypt',
            topVendors: [
              { vendorId: 1, vendorName: 'Vendor 1', avgScore: '85.50' }
            ],
            expansionDocumentsCount: 5
          }
        ]
      };

      mockAnalyticsService.getTopVendors.mockResolvedValue(expectedResult);

      const result = await controller.getTopVendors();

      expect(result).toEqual(expectedResult);
      expect(mockAnalyticsService.getTopVendors).toHaveBeenCalled();
    });
  });
});

