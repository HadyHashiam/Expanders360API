import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getCurrentUser: jest.fn(),
    getAll: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const expectedResult = {
        id: 1,
        email: 'user@test.com',
        username: 'testuser',
        userType: UserType.CLIENT
      };

      mockUsersService.getCurrentUser.mockResolvedValue(expectedResult);

      const result = await controller.getCurrentUser(mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.getCurrentUser).toHaveBeenCalledWith(mockPayload.id);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        message: 'Users Retrieved Successfully',
        results: 1,
        pagination: { page: 1, limit: 10, total: 1 },
        data: [{ id: 1, email: 'user@test.com', username: 'testuser' }]
      };

      mockUsersService.getAll.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers(query);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.getAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = '1';
      const expectedResult = {
        status: 'success',
        data: { id: 1, email: 'user@test.com', username: 'testuser' },
        message: 'User Retrieved Successfully'
      };

      mockUsersService.getUserById.mockResolvedValue(expectedResult);

      const result = await controller.getUserById(userId);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.getUserById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const userId = '1';
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
        password: 'newpassword'
      };

      const expectedResult = {
        id: 1,
        email: 'user@test.com',
        username: 'updateduser',
        userType: UserType.CLIENT
      };

      mockUsersService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(userId, mockPayload, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, mockPayload, updateDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = '1';
      const expectedResult = { message: 'User deleted successfully' };

      mockUsersService.deleteUser.mockResolvedValue(expectedResult);

      const result = await controller.deleteUser(userId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1, mockPayload);
    });
  });
});
