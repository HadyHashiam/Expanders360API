import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendor.controller';
import { VendorsService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';

describe('VendorsController', () => {
  let controller: VendorsController;
  let service: VendorsService;

  const mockVendorsService = {
    createVendor: jest.fn(),
    getAllVendors: jest.fn(),
    getVendorById: jest.fn(),
    updateVendor: jest.fn(),
    deleteVendor: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        {
          provide: VendorsService,
          useValue: mockVendorsService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<VendorsController>(VendorsController);
    service = module.get<VendorsService>(VendorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVendor', () => {
    it('should create vendor', async () => {
      const createDto: CreateVendorDto = {
        name: 'Test Vendor',
        email: 'test@vendor.com',
        countries_supported: [1, 2],
        services_offered: [1, 2],
        rating: 4.5,
        response_sla_hours: 24
      };

      const expectedResult = { id: 1, ...createDto };

      mockVendorsService.createVendor.mockResolvedValue(expectedResult);

      const result = await controller.createVendor(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockVendorsService.createVendor).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getAllVendors', () => {
    it('should return all vendors', async () => {
      const queryParams = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: 1, name: 'Test Vendor', rating: 4.5 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockVendorsService.getAllVendors.mockResolvedValue(expectedResult);

      const result = await controller.getAllVendors(queryParams);

      expect(result).toEqual(expectedResult);
      expect(mockVendorsService.getAllVendors).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('getVendorById', () => {
    it('should return vendor by id', async () => {
      const vendorId = 1;
      const expectedResult = { id: 1, name: 'Test Vendor', rating: 4.5 };

      mockVendorsService.getVendorById.mockResolvedValue(expectedResult);

      const result = await controller.getVendorById(vendorId);

      expect(result).toEqual(expectedResult);
      expect(mockVendorsService.getVendorById).toHaveBeenCalledWith(vendorId);
    });
  });

  describe('updateVendor', () => {
    it('should update vendor', async () => {
      const vendorId = 1;
      const updateDto: UpdateVendorDto = {
        name: 'Updated Vendor',
        rating: 4.8
      };

      const expectedResult = { id: 1, ...updateDto };

      mockVendorsService.updateVendor.mockResolvedValue(expectedResult);

      const result = await controller.updateVendor(vendorId, updateDto, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockVendorsService.updateVendor).toHaveBeenCalledWith(vendorId, updateDto, mockPayload);
    });
  });

  describe('deleteVendor', () => {
    it('should delete vendor', async () => {
      const vendorId = 1;
      const expectedResult = { message: 'Vendor deleted successfully' };

      mockVendorsService.deleteVendor.mockResolvedValue(expectedResult);

      const result = await controller.deleteVendor(vendorId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockVendorsService.deleteVendor).toHaveBeenCalledWith(vendorId, mockPayload);
    });
  });
});
