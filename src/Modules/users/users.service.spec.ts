import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ClientsService } from './clients/clients.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { Resource_Name, Models_Name } from '../../utils/enums';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let clientsService: ClientsService;
  let factory: HandlerFactory<User>;

  const mockUserRepository = {
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

  const mockClientsService = {
    updateClientByUserId: jest.fn()
  };

  const mockFactory = {
    getOne: jest.fn(),
    getAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
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

  const mockUser: User = {
    id: 1,
    email: 'user@test.com',
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: ClientsService,
          useValue: mockClientsService
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    clientsService = module.get<ClientsService>(ClientsService);
    
    // Mock the factory
    service['factory'] = mockFactory as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      mockFactory.getOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(1);

      expect(result).toEqual(mockUser);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      mockFactory.getOne.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(result.status).toBe('success');
      expect(result.message).toBe('User Retrieved Successfully');
      expect(result.data).toEqual(mockUser);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getAll', () => {
    it('should return all users with pagination', async () => {
      const mockResult = {
        data: [mockUser],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      mockFactory.getAll.mockResolvedValue(mockResult);

      const result = await service.getAll({});

      expect(result.status).toBe('success');
      expect(result.message).toBe('Users Retrieved Successfully');
      expect(result.results).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(mockFactory.getAll).toHaveBeenCalledWith({}, Resource_Name.USERS, Models_Name.USER);
    });
  });

  describe('updateUser', () => {
    const updateDto: UpdateUserDto = {
      username: 'updateduser',
      password: 'newpassword'
    };

    it('should update user successfully for same user', async () => {
      const updatedUser = { ...mockUser, username: updateDto.username };
      mockFactory.getOne.mockResolvedValue(mockUser);
      mockFactory.updateOne.mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, mockPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, expect.objectContaining({
        username: updateDto.username,
        password: expect.any(String) // hashed password
      }));
    });

    it('should update user successfully for admin', async () => {
      const updatedUser = { ...mockUser, username: updateDto.username };
      mockFactory.getOne.mockResolvedValue(mockUser);
      mockFactory.updateOne.mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, mockAdminPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.updateOne).toHaveBeenCalledWith(1, expect.objectContaining({
        username: updateDto.username,
        password: expect.any(String) // hashed password
      }));
    });

    it('should throw ForbiddenException for different user', async () => {
      const differentPayload = { ...mockPayload, id: 2 };
      mockFactory.getOne.mockResolvedValue(mockUser);

      await expect(service.updateUser(1, differentPayload, updateDto))
        .rejects.toThrow('You are not allowed to update this user');
    });

    it('should update client when user is client', async () => {
      const updatedUser = { ...mockUser, username: updateDto.username };
      mockFactory.getOne.mockResolvedValue(mockUser);
      mockFactory.updateOne.mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, mockPayload, updateDto);

      expect(mockClientsService.updateClientByUserId).toHaveBeenCalledWith(1, {
        company_name: updateDto.username
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully for same user', async () => {
      const deleteResult = { message: 'User deleted successfully' };
      mockFactory.getOne.mockResolvedValue(mockUser);
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteUser(1, mockPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should delete user successfully for admin', async () => {
      const deleteResult = { message: 'User deleted successfully' };
      mockFactory.getOne.mockResolvedValue(mockUser);
      mockFactory.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.deleteUser(1, mockAdminPayload);

      expect(result).toEqual(deleteResult);
      expect(mockFactory.getOne).toHaveBeenCalledWith(1);
      expect(mockFactory.deleteOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for different user', async () => {
      const differentPayload = { ...mockPayload, id: 2 };
      mockFactory.getOne.mockResolvedValue(mockUser);

      await expect(service.deleteUser(1, differentPayload))
        .rejects.toThrow('You are not allowed to delete this user');
    });
  });
});
