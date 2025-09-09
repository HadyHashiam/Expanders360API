import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';

describe('SystemConfigController', () => {
  let controller: SystemConfigController;
  let service: SystemConfigService;

  const mockSystemConfigService = {
    createSystemConfig: jest.fn(),
    getAllConfigs: jest.fn(),
    getConfigById: jest.fn(),
    updateConfig: jest.fn(),
    deleteConfig: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigController],
      providers: [
        {
          provide: SystemConfigService,
          useValue: mockSystemConfigService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<SystemConfigController>(SystemConfigController);
    service = module.get<SystemConfigService>(SystemConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSystemConfig', () => {
    it('should create system config', async () => {
      const createDto: CreateSystemConfigDto = {
        key: 'test_key',
        value: 100,
        description: 'Test config'
      };
      const expectedResult = { id: 1, ...createDto };

      mockSystemConfigService.createSystemConfig.mockResolvedValue(expectedResult);

      const result = await controller.createSystemConfig(createDto, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockSystemConfigService.createSystemConfig).toHaveBeenCalledWith(createDto, mockPayload);
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: 1, key: 'test', value: 100 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockSystemConfigService.getAllConfigs.mockResolvedValue(expectedResult);

      const result = await controller.getAllConfigs(query);

      expect(result).toEqual(expectedResult);
      expect(mockSystemConfigService.getAllConfigs).toHaveBeenCalledWith(query);
    });
  });

  describe('getConfigById', () => {
    it('should return config by id', async () => {
      const configId = 1;
      const expectedResult = { id: 1, key: 'test', value: 100 };

      mockSystemConfigService.getConfigById.mockResolvedValue(expectedResult);

      const result = await controller.getConfigById(configId);

      expect(result).toEqual(expectedResult);
      expect(mockSystemConfigService.getConfigById).toHaveBeenCalledWith(configId);
    });
  });

  describe('updateConfig', () => {
    it('should update config', async () => {
      const configId = 1;
      const updateDto: UpdateSystemConfigDto = {
        key: 'updated_key',
        value: 200
      };
      const expectedResult = { id: 1, ...updateDto };

      mockSystemConfigService.updateConfig.mockResolvedValue(expectedResult);

      const result = await controller.updateConfig(configId, updateDto, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockSystemConfigService.updateConfig).toHaveBeenCalledWith(configId, updateDto, mockPayload);
    });
  });

  describe('deleteConfig', () => {
    it('should delete config', async () => {
      const configId = 1;
      const expectedResult = { message: 'Config deleted successfully' };

      mockSystemConfigService.deleteConfig.mockResolvedValue(expectedResult);

      const result = await controller.deleteConfig(configId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockSystemConfigService.deleteConfig).toHaveBeenCalledWith(configId, mockPayload);
    });
  });
});
