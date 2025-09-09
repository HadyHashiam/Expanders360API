import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: Repository<Country>;
  let factory: HandlerFactory<Country>;

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
        CountriesService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockRepository
        }
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<Repository<Country>>(getRepositoryToken(Country));
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCountries', () => {
    it('should return paginated countries', async () => {
      const mockResult = {
        data: [{ id: 1, name: 'Egypt', code: 'EG' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllCountries({});

      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.COUNTRIES, Models_Name.COUNTRY);
    });
  });

  describe('getCountryById', () => {
    it('should return country by id', async () => {
      const mockCountry = { id: 1, name: 'Egypt', code: 'EG' };
      mockFactory.getOne.mockResolvedValue(mockCountry);

      const result = await service.getCountryById(1);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockCountry);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createCountry', () => {
    it('should create country successfully', async () => {
      const createDto = { name: 'Egypt', code: 'EG' };
      const createdCountry = { id: 1, ...createDto };
      mockFactory.create.mockResolvedValue(createdCountry);

      const result = await service.createCountry(createDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(createdCountry);
      expect(mockFactory.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateCountry', () => {
    it('should update country successfully', async () => {
      const updateDto = { name: 'Updated Egypt' };
      const updatedCountry = { id: 1, name: 'Updated Egypt', code: 'EG' };
      mockFactory.updateOne.mockResolvedValue(updatedCountry);

      const result = await service.updateCountry(1, updateDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(updatedCountry);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteCountry', () => {
    it('should delete country successfully', async () => {
      const deleteResult = { message: 'Country deleted successfully', data: {}, status: 'success' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteCountry(1);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});

