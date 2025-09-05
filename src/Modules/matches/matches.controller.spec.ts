import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { OwnerGuard } from '../users/guards/owner.guard';
import { UserType } from '../../utils/enums';
import { ForbiddenException } from '@nestjs/common';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;
  let mockRolesGuard: jest.Mocked<RolesGuard>;
  let mockOwnerGuard: jest.Mocked<OwnerGuard>;

  const mockUser = {
    id: 1,
    userType: UserType.CLIENT,
    sessionId: 1,
  };

  const mockMatches: any[] = [
    {
      id: 1,
      projectId: 1,
      vendorId: 1,
      score: 85.5,
      notifiedAt: new Date(),
      is_sla_expired: false,
      project: { id: 1, title: 'Test Project' },
      vendor: { id: 1, name: 'Test Vendor' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockRebuildResult = {
    length: 1,
    matches: mockMatches,
    totalMatchesCount: 1,
  };

  beforeEach(async () => {
    const mockService = {
      rebuildMatches: jest.fn(),
      getAllMatches: jest.fn(),
      getMatchById: jest.fn(),
      deleteMatch: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    } as any;

    mockRolesGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    } as any;

    mockOwnerGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .overrideGuard(OwnerGuard)
      .useValue(mockOwnerGuard)
      .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rebuildMatches', () => {
    it('should rebuild matches successfully', async () => {
      jest.spyOn(service, 'rebuildMatches').mockResolvedValue(mockRebuildResult);

      const result = await controller.rebuildMatches(1, mockUser);

      expect(service.rebuildMatches).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockRebuildResult);
    });

    it('should throw ForbiddenException for unauthorized access to project', async () => {
      mockOwnerGuard.canActivate.mockResolvedValue(false);
      jest.spyOn(service, 'rebuildMatches').mockRejectedValue(
        new ForbiddenException('You are not allowed to access this resource')
      );

      await expect(
        controller.rebuildMatches(1, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllMatches', () => {
    it('should return all matches', async () => {
      const matchesResponse = {
        status: 'success',
        results: 1,
        pagination: { page: 1, limit: 10 },
        data: mockMatches,
      };

      jest.spyOn(service, 'getAllMatches').mockResolvedValue(matchesResponse);

      const result = await controller.getAllMatches({});

      expect(service.getAllMatches).toHaveBeenCalledWith({});
      expect(result).toEqual(matchesResponse);
    });
  });

  describe('getMatchById', () => {
    it('should return a match by ID', async () => {
      jest.spyOn(service, 'getMatchById').mockResolvedValue(mockMatches[0]);

      const result = await controller.getMatchById(1);

      expect(service.getMatchById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMatches[0]);
    });
  });

  describe('deleteMatch', () => {
    it('should delete a match successfully', async () => {
      const deleteResult = { message: 'Match deleted successfully' };
      jest.spyOn(service, 'deleteMatch').mockResolvedValue(deleteResult);

      const result = await controller.deleteMatch(1, mockUser);

      expect(service.deleteMatch).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(deleteResult);
    });

    it('should throw ForbiddenException for unauthorized access to match', async () => {
      mockOwnerGuard.canActivate.mockResolvedValue(false);
      jest.spyOn(service, 'deleteMatch').mockRejectedValue(
        new ForbiddenException('You are not allowed to access this resource')
      );

      await expect(
        controller.deleteMatch(1, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
