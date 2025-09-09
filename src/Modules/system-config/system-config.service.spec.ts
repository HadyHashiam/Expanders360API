import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigService } from './system-config.service';
import { SystemConfig } from './entities/system-config.entity';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';

describe('SystemConfigService', () => {
  let service: SystemConfigService;
  let repository: Repository<SystemConfig>;
  let factory: HandlerFactory<SystemConfig>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    metadata: {
      relations: []
    }
  };

  const mockFactory = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemConfigService,
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: mockRepository
        }
      ],
    }).compile();

    service = module.get<SystemConfigService>(SystemConfigService);
    repository = module.get<Repository<SystemConfig>>(getRepositoryToken(SystemConfig));
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSystemConfig', () => {
    const createDto: CreateSystemConfigDto = {
      key: 'test_key',
      value: 100,
      description: 'Test config'
    };

    it('should create system config successfully for admin', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(createDto);

      const result = await service.createSystemConfig(createDto, mockPayload);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { key: createDto.key } });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createDto);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminPayload = { ...mockPayload, userType: UserType.CLIENT };

      await expect(service.createSystemConfig(createDto, nonAdminPayload))
        .rejects.toThrow('Only admins can create system configs');
    });

    it('should throw BadRequestException for duplicate key', async () => {
      mockRepository.findOne.mockResolvedValue(createDto);

      await expect(service.createSystemConfig(createDto, mockPayload))
        .rejects.toThrow(`Configuration with key '${createDto.key}' already exists`);
    });
  });

  describe('getConfigValue', () => {
    it('should return config value when found', async () => {
      const config = { key: 'test_key', value: 100 };
      mockRepository.findOne.mockResolvedValue(config);

      const result = await service.getConfigValue('test_key', 50);

      expect(result).toBe(100);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { key: 'test_key' } });
    });

    it('should return default value when config not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getConfigValue('test_key', 50);

      expect(result).toBe(50);
    });

    it('should return default value on error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.getConfigValue('test_key', 50);

      expect(result).toBe(50);
    });
  });

  describe('getAllConfigs', () => {
    it('getAllConfigs returns unified shape', async () => {
      const mockResult = {
        status: 'success',
        data: [{ id: 1, key: 'test', value: 100 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllConfigs({});

      expect(result.status).toBe('success');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, 'systemConfigs', 'config');
    });
  });

  describe('getConfigById', () => {
    it('should return config by id', async () => {
      const config = { id: 1, key: 'test', value: 100 };
      mockFactory.getOne.mockResolvedValue(config);

      const result = await service.getConfigById(1);

      expect(result).toEqual(config);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateConfig', () => {
    const updateDto: UpdateSystemConfigDto = {
      key: 'updated_key',
      value: 200
    };

    it('should update config successfully for admin', async () => {
      const existingConfig = { id: 1, key: 'old_key', value: 100 };
      mockRepository.findOne.mockResolvedValue(null);
      mockFactory.getOne.mockResolvedValue(existingConfig);
      mockFactory.updateOne.mockResolvedValue({ ...existingConfig, ...updateDto });

      const result = await service.updateConfig(1, updateDto, mockPayload);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { key: updateDto.key, id: expect.any(Object) }
      });
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, expect.objectContaining(updateDto));
      expect(result).toEqual(expect.objectContaining(updateDto));
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminPayload = { ...mockPayload, userType: UserType.CLIENT };

      await expect(service.updateConfig(1, updateDto, nonAdminPayload))
        .rejects.toThrow('Only admins can update system configs');
    });

    it('should throw BadRequestException for duplicate key', async () => {
      const existingConfig = { id: 2, key: 'updated_key', value: 200 };
      mockRepository.findOne.mockResolvedValue(existingConfig);

      await expect(service.updateConfig(1, updateDto, mockPayload))
        .rejects.toThrow(`Configuration with key '${updateDto.key}' already exists`);
    });
  });

  describe('deleteConfig', () => {
    it('should delete config successfully for admin', async () => {
      const deleteResult = { message: 'Config deleted successfully' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteConfig(1, mockPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminPayload = { ...mockPayload, userType: UserType.CLIENT };

      await expect(service.deleteConfig(1, nonAdminPayload))
        .rejects.toThrow('Only admins can delete system configs');
    });
  });
});
