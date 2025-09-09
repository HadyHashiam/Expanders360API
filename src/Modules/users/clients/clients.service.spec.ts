import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { HandlerFactory } from '../../../utils/handlerFactory/handler-factory.postgres';
import { UserType } from '../../../utils/enums';
import { Resource_Name, Models_Name } from '../../../utils/enums';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: Repository<Client>;
  let factory: HandlerFactory<Client>;

  const mockClientRepository = {
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
    getOne: jest.fn(),
    getAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };

  const mockPayload = {
    id: 1,
    userType: UserType.ADMIN
  };

  const mockClientPayload = {
    id: 1,
    userType: UserType.CLIENT
  };

  const mockClient: Client = {
    id: 1,
    userId: 1,
    company_name: 'Test Company',
    contact_email: 'client@test.com',
    user: {
      id: 1,
      email: 'client@test.com',
      username: 'testuser',
      password: 'hashedpassword',
      userType: UserType.CLIENT,
      isAccountVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository
        }
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClientById', () => {
    it('should return client by id', async () => {
      mockFactory.getOne.mockResolvedValue(mockClient);

      const result = await service.getClientById(1);

      expect(result).toEqual(mockClient);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockFactory.getOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getClientById(1))
        .rejects.toThrow('Failed to fetch client');
    });
  });

  describe('getClientByUserId', () => {
    it('should return client by user id', async () => {
      mockClientRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.getClientByUserId(1);

      expect(result).toEqual(mockClient);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['user']
      });
    });

    it('should throw NotFoundException when client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.getClientByUserId(1))
        .rejects.toThrow('Client not found for this user');
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockClientRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getClientByUserId(1))
        .rejects.toThrow('Failed to fetch client');
    });
  });

  describe('updateClientByUserId', () => {
    it('should update client by user id', async () => {
      const updateDto = { company_name: 'Updated Company' };
      const updatedClient = { ...mockClient, company_name: updateDto.company_name };

      mockClientRepository.findOne.mockResolvedValue(mockClient);
      mockClientRepository.save.mockResolvedValue(updatedClient);

      const result = await service.updateClientByUserId(1, updateDto);

      expect(result).toEqual(updatedClient);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockClientRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        company_name: updateDto.company_name
      }));
    });

    it('should throw NotFoundException when client not found', async () => {
      const updateDto = { company_name: 'Updated Company' };
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.updateClientByUserId(1, updateDto))
        .rejects.toThrow('Client not found for this user');
    });

    it('should throw InternalServerErrorException on error', async () => {
      const updateDto = { company_name: 'Updated Company' };
      mockClientRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.updateClientByUserId(1, updateDto))
        .rejects.toThrow('Failed to update client');
    });
  });

  describe('getAllClients', () => {
    it('should return all clients with pagination', async () => {
      const mockResult = {
        status: 'success',
        results: 1,
        pagination: { page: 1, limit: 10, total: 1 },
        data: [mockClient]
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAllClients({});

      expect(result).toEqual(mockResult);
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.CLIENTS, Models_Name.CLIENT);
    });
  });

  describe('updateClient', () => {
    it('should update client successfully for admin', async () => {
      const updateDto = { company_name: 'Updated Company' };
      const updatedClient = { ...mockClient, company_name: updateDto.company_name };

      mockFactory.getOne.mockResolvedValue(mockClient);
      mockFactory.updateOne.mockResolvedValue(updatedClient);

      const result = await service.updateClient(1, updateDto, mockPayload);

      expect(result).toEqual(updatedClient);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, expect.objectContaining(updateDto));
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const updateDto = { company_name: 'Updated Company' };

      await expect(service.updateClient(1, updateDto, mockClientPayload))
        .rejects.toThrow('Only admins can update clients');
    });
  });

  describe('deleteClient', () => {
    it('should delete client successfully for admin', async () => {
      const deleteResult = { message: 'Client deleted successfully' };
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteClient(1, mockPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      await expect(service.deleteClient(1, mockClientPayload))
        .rejects.toThrow('Only admins can delete clients');
    });
  });
});
