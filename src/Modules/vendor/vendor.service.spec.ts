import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { VendorsService } from './vendor.service';
import { Vendor } from './entities/vendor.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';

describe('VendorsService', () => {
  let service: VendorsService;
  let vendorRepository: Repository<Vendor>;
  let countryRepository: Repository<Country>;
  let serviceRepository: Repository<Service>;
  let factory: HandlerFactory<Vendor>;

  const mockVendorRepository = {
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

  const mockCountryRepository = {
    find: jest.fn(),
    findOne: jest.fn()
  };

  const mockServiceRepository = {
    find: jest.fn(),
    findOne: jest.fn()
  };

  const mockFactory = {
    create: jest.fn(),
    getOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    getAll: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  const mockClientPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.CLIENT,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: getRepositoryToken(Vendor),
          useValue: mockVendorRepository
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepository
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository
        }
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    vendorRepository = module.get<Repository<Vendor>>(getRepositoryToken(Vendor));
    countryRepository = module.get<Repository<Country>>(getRepositoryToken(Country));
    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVendor', () => {
    const createDto: CreateVendorDto = {
      name: 'Test Vendor',
      email: 'test@vendor.com',
      countries_supported: [1, 2],
      services_offered: [1, 2],
      rating: 4.5,
      response_sla_hours: 24
    };

    const mockCountries = [
      { id: 1, name: 'Egypt' },
      { id: 2, name: 'Saudi Arabia' }
    ];

    const mockServices = [
      { id: 1, name: 'Web Development' },
      { id: 2, name: 'Mobile Development' }
    ];

    const mockVendor = { id: 1, ...createDto };

    it('should create vendor successfully', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockVendorRepository.findOne.mockResolvedValue(null);
      mockFactory.create.mockResolvedValue(mockVendor);

      const result = await service.createVendor(createDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockVendor);
      expect(mockCountryRepository.find).toHaveBeenCalledWith({ where: { id: In(createDto.countries_supported) } });
      expect(mockServiceRepository.find).toHaveBeenCalledWith({ where: { id: In(createDto.services_offered) } });
      expect(mockVendorRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(mockFactory.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException for invalid countries', async () => {
      mockCountryRepository.find.mockResolvedValue([{ id: 1, name: 'Egypt' }]);

      await expect(service.createVendor(createDto))
        .rejects.toThrow('One or more country IDs not found');
    });

    it('should throw BadRequestException for invalid services', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue([{ id: 1, name: 'Web Development' }]);

      await expect(service.createVendor(createDto))
        .rejects.toThrow('One or more services_offered are invalid');
    });

    it('should throw ConflictException for duplicate vendor name', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockVendorRepository.findOne.mockResolvedValue(mockVendor);

      await expect(service.createVendor(createDto))
        .rejects.toThrow(`Vendor with name ${createDto.name} already exists`);
    });
  });

  // describe('getAllVendors', () => {
  //   it('should return paginated vendors', async () => {
  //     const mockResult = {
  //       data: [{ id: 1, name: 'Test Vendor', rating: 4.5 }],
  //       pagination: { page: 1, limit: 10, total: 1 }
  //     };
  //     mockFactory.getAll.mockResolvedValue(mockResult);

  //     const result = await service.getAllVendors({});

  //     expect(result.status).toBe('success');
  //     expect(result.message).toBe('Vendors Retrieved Successfully');
  //     expect(Array.isArray(result.data)).toBe(true);
  //     expect(result.pagination).toBeDefined();
  //     expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.VENDORS, Models_Name.VENDOR);
  //   });
  // });

  describe('getVendorById', () => {
    it('should return vendor by id', async () => {
      const mockVendor = { id: 1, name: 'Test Vendor', rating: 4.5 };
      mockFactory.getOne.mockResolvedValue(mockVendor);

      const result = await service.getVendorById(1);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockVendor);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateVendor', () => {
    const updateDto: UpdateVendorDto = {
      name: 'Updated Vendor',
      countries_supported: [1, 2],
      services_offered: [1, 2]
    };

    const mockCountries = [
      { id: 1, name: 'Egypt' },
      { id: 2, name: 'Saudi Arabia' }
    ];

    const mockServices = [
      { id: 1, name: 'Web Development' },
      { id: 2, name: 'Mobile Development' }
    ];

    const mockUpdatedVendor = { id: 1, ...updateDto };

    it('should update vendor successfully', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockVendorRepository.findOne.mockResolvedValue(null);
      mockFactory.updateOne.mockResolvedValue(mockUpdatedVendor);

      const result = await service.updateVendor(1, updateDto, mockPayload);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockUpdatedVendor);
      expect(mockCountryRepository.find).toHaveBeenCalledWith({ where: { id: In(updateDto.countries_supported) } });
      expect(mockServiceRepository.find).toHaveBeenCalledWith({ where: { id: In(updateDto.services_offered) } });
      expect(mockVendorRepository.findOne).toHaveBeenCalledWith({ where: { name: updateDto.name, id: Not(1) } });
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException for invalid countries', async () => {
      mockCountryRepository.find.mockResolvedValue([{ id: 1, name: 'Egypt' }]);

      await expect(service.updateVendor(1, updateDto, mockPayload))
        .rejects.toThrow('One or more country IDs not found');
    });

    it('should throw BadRequestException for invalid services', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue([{ id: 1, name: 'Web Development' }]);

      await expect(service.updateVendor(1, updateDto, mockPayload))
        .rejects.toThrow('One or more services_offered are invalid');
    });

    it('should throw ConflictException for duplicate vendor name', async () => {
      mockCountryRepository.find.mockResolvedValue(mockCountries);
      mockServiceRepository.find.mockResolvedValue(mockServices);
      mockVendorRepository.findOne.mockResolvedValue(mockUpdatedVendor);

      await expect(service.updateVendor(1, updateDto, mockPayload))
        .rejects.toThrow(`Vendor with name ${updateDto.name} already exists`);
    });
  });

  describe('deleteVendor', () => {
    it('should delete vendor successfully for admin', async () => {
      const deleteResult = { message: 'Vendor deleted successfully', data: {}, status: 'success' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteVendor(1, mockPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      await expect(service.deleteVendor(1, mockClientPayload))
        .rejects.toThrow('Only admins can delete vendors');
    });
  });
});
