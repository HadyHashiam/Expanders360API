import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  const mockCountriesService = {
    createCountry: jest.fn(),
    getAllCountries: jest.fn(),
    getCountryById: jest.fn(),
    updateCountry: jest.fn(),
    deleteCountry: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: mockCountriesService
        }
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    service = module.get<CountriesService>(CountriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a country', async () => {
      const createDto: CreateCountryDto = {
        name: 'Egypt'
      };
      const expectedResult = { id: 1, ...createDto };

      mockCountriesService.createCountry.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockCountriesService.createCountry).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all countries', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: 1, name: 'Egypt', code: 'EG' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockCountriesService.getAllCountries.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockCountriesService.getAllCountries).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return country by id', async () => {
      const countryId = '1';
      const expectedResult = { id: 1, name: 'Egypt', code: 'EG' };

      mockCountriesService.getCountryById.mockResolvedValue(expectedResult);

      const result = await controller.findOne(countryId);

      expect(result).toEqual(expectedResult);
      expect(mockCountriesService.getCountryById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update country', async () => {
      const countryId = '1';
      const updateDto: UpdateCountryDto = {
        name: 'Updated Egypt'
      };
      const expectedResult = { id: 1, name: 'Updated Egypt', code: 'EG' };

      mockCountriesService.updateCountry.mockResolvedValue(expectedResult);

      const result = await controller.update(countryId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockCountriesService.updateCountry).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete country', async () => {
      const countryId = '1';
      const expectedResult = { message: 'Country deleted successfully' };

      mockCountriesService.deleteCountry.mockResolvedValue(expectedResult);

      const result = await controller.remove(countryId);

      expect(result).toEqual(expectedResult);
      expect(mockCountriesService.deleteCountry).toHaveBeenCalledWith(1);
    });
  });
});
