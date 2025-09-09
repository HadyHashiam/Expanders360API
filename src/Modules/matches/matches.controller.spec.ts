import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType } from '../../utils/types/types';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { OwnerGuard } from '../users/guards/owner.guard';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatchesService = {
    rebuildMatches: jest.fn(),
    getAllMatchesForProject: jest.fn(),
    getMatchById: jest.fn(),
    deleteMatch: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.ADMIN,
    sessionId: 1
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(OwnerGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('rebuildMatches', () => {
    it('should rebuild matches for project', async () => {
      const projectId = 1;
      const expectedResult = {
        status: 'success',
        data: { length: 5, totalMatchesCount: 5, matches: [] }
      };

      mockMatchesService.rebuildMatches.mockResolvedValue(expectedResult);

      const result = await controller.rebuildMatches(projectId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockMatchesService.rebuildMatches).toHaveBeenCalledWith(projectId, mockPayload);
    });
  });

  describe('getAllMatches', () => {
    it('should return all matches for project', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: 1, projectId: 1, vendorId: 1, score: 85.5 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockMatchesService.getAllMatchesForProject.mockResolvedValue(expectedResult);

      const result = await controller.getAllMatches(projectId, query);

      expect(result).toEqual(expectedResult);
      expect(mockMatchesService.getAllMatchesForProject).toHaveBeenCalledWith(projectId, query);
    });
  });

  describe('getMatchById', () => {
    it('should return match by id', async () => {
      const matchId = 1;
      const expectedResult = {
        status: 'success',
        data: { id: 1, projectId: 1, vendorId: 1, score: 85.5 }
      };

      mockMatchesService.getMatchById.mockResolvedValue(expectedResult);

      const result = await controller.getMatchById(matchId);

      expect(result).toEqual(expectedResult);
      expect(mockMatchesService.getMatchById).toHaveBeenCalledWith(matchId);
    });
  });

  describe('deleteMatch', () => {
    it('should delete match', async () => {
      const matchId = 1;
      const expectedResult = { message: 'Match deleted successfully' };

      mockMatchesService.deleteMatch.mockResolvedValue(expectedResult);

      const result = await controller.deleteMatch(matchId, mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockMatchesService.deleteMatch).toHaveBeenCalledWith(matchId, mockPayload);
    });
  });
});
