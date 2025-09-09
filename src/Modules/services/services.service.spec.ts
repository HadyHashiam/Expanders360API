import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';

describe('ServicesService', () => {
  let service: ServicesService;
  let repository: Repository<Service>;
  let factory: HandlerFactory<Service>;

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
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockRepository
        }
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get<Repository<Service>>(getRepositoryToken(Service));
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllServices', () => {
    it('should return paginated services', async () => {
      const mockResult = {
        data: [{ id: 1, name: 'Web Development', description: 'Web development service' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllServices({});

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.SERVICES, Models_Name.SERVICE);
    });
  });

  describe('getServiceById', () => {
    it('should return service by id', async () => {
      const mockService = { id: 1, name: 'Web Development', description: 'Web development service' };
      mockFactory.getOne.mockResolvedValue(mockService);

      const result = await service.getServiceById(1);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockService);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createService', () => {
    it('should create service successfully', async () => {
      const createDto = { name: 'Mobile Development', description: 'Mobile development service' };
      const createdService = { id: 1, ...createDto };
      mockFactory.create.mockResolvedValue(createdService);

      const result = await service.createService(createDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(createdService);
      expect(mockFactory.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateService', () => {
    it('should update service successfully', async () => {
      const updateDto = { name: 'Updated Web Development' };
      const updatedService = { id: 1, name: 'Updated Web Development', description: 'Web development service' };
      mockFactory.updateOne.mockResolvedValue(updatedService);

      const result = await service.updateService(1, updateDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(updatedService);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteService', () => {
    it('should delete service successfully', async () => {
      const deleteResult = { message: 'Service deleted successfully', data: {}, status: 'success' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteService(1);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});

