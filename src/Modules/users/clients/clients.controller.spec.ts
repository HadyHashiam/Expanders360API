import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { UserType } from '../../../utils/enums';
import { JWTPayLoadType } from '../../../utils/types/types';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../../auth/guards/RolesGuard';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

  const mockClientsService = {
    getClientByUserId: jest.fn(),
    getAllClients: jest.fn(),
    getClientById: jest.fn(),
    deleteClient: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.CLIENT,
    sessionId: 1
  };

  const mockAdminPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentClient', () => {
    it('should return current client', async () => {
      const expectedResult = {
        id: 1,
        userId: 1,
        company_name: 'Test Company',
        contact_email: 'client@test.com',
        user: {
          id: 1,
          email: 'client@test.com',
          username: 'testuser',
          userType: UserType.CLIENT
        }
      };

      mockClientsService.getClientByUserId.mockResolvedValue(expectedResult);

      const result = await controller.getCurrentClient(mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.getClientByUserId).toHaveBeenCalledWith(mockPayload.id);
    });
  });

  describe('getAllClients', () => {
    it('should return all clients for admin', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        results: 1,
        pagination: { page: 1, limit: 10, total: 1 },
        data: [
          {
            id: 1,
            userId: 1,
            company_name: 'Test Company',
            contact_email: 'client@test.com'
          }
        ]
      };

      mockClientsService.getAllClients.mockResolvedValue(expectedResult);

      const result = await controller.getAllClients(query);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.getAllClients).toHaveBeenCalledWith(query);
    });
  });

  describe('getClientById', () => {
    it('should return client by id', async () => {
      const clientId = 1;
      const expectedResult = {
        id: 1,
        userId: 1,
        company_name: 'Test Company',
        contact_email: 'client@test.com'
      };

      mockClientsService.getClientById.mockResolvedValue(expectedResult);

      const result = await controller.getClientById(clientId);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.getClientById).toHaveBeenCalledWith(clientId);
    });
  });

  describe('deleteClient', () => {
    it('should delete client for admin', async () => {
      const clientId = 1;
      const expectedResult = { message: 'Client deleted successfully' };

      mockClientsService.deleteClient.mockResolvedValue(expectedResult);

      const result = await controller.deleteClient(clientId, mockAdminPayload);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.deleteClient).toHaveBeenCalledWith(clientId, mockAdminPayload);
    });
  });
});
