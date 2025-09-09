import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  const mockServicesService = {
    createService: jest.fn(),
    getAllServices: jest.fn(),
    getServiceById: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService
        }
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a service', async () => {
      const createDto: CreateServiceDto = {
        name: 'Web Development'
      };

      const expectedResult = { id: 1, ...createDto };

      mockServicesService.createService.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockServicesService.createService).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all services', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: 1, name: 'Web Development', description: 'Web development service' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockServicesService.getAllServices.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockServicesService.getAllServices).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return service by id', async () => {
      const serviceId = '1';
      const expectedResult = { id: 1, name: 'Web Development', description: 'Web development service' };

      mockServicesService.getServiceById.mockResolvedValue(expectedResult);

      const result = await controller.findOne(serviceId);

      expect(result).toEqual(expectedResult);
      expect(mockServicesService.getServiceById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update service', async () => {
      const serviceId = '1';
      const updateDto: UpdateServiceDto = {
        name: 'Updated Web Development'
      };

      const expectedResult = { id: 1, name: 'Updated Web Development', description: 'Web development service' };

      mockServicesService.updateService.mockResolvedValue(expectedResult);

      const result = await controller.update(serviceId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockServicesService.updateService).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete service', async () => {
      const serviceId = '1';
      const expectedResult = { message: 'Service deleted successfully' };

      mockServicesService.deleteService.mockResolvedValue(expectedResult);

      const result = await controller.remove(serviceId);

      expect(result).toEqual(expectedResult);
      expect(mockServicesService.deleteService).toHaveBeenCalledWith(1);
    });
  });
});
