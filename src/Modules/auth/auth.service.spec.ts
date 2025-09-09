import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Session } from '../session/session.entity';
import { Client } from '../users/clients/entities/client.entity';
import { MailsService } from '../mails/mails.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserType } from '../../utils/enums';
import { DeviceInfo } from '../../utils/types/types';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn()
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let sessionRepository: Repository<Session>;
  let clientRepository: Repository<Client>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mailsService: MailsService;

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

  const mockSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    metadata: {
      relations: []
    }
  };

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

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn()
  };

  const mockMailsService = {
    confirmRegisterUser: jest.fn(),
    sendPasswordResetEmail: jest.fn()
  };

  const bcrypt = require('bcryptjs');

  const services = [
    'Software Development',
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Digital Marketing',
    'SEO Optimization',
    'Content Creation',
    'Social Media Management',
    'E-commerce Development',
    'Cloud Infrastructure',
    'DevOps Services',
    'Data Analytics',
    'Machine Learning',
    'Cybersecurity',
    'IT Consulting',
    'Project Management',
    'Quality Assurance',
    'Technical Support',
    'Training & Workshops',
    'Business Analysis',
    'System Integration',
    'API Development',
    'Database Design',
    'Network Administration',
    'Hardware Support',
    'Software Testing',
    'Performance Optimization',
    'Migration Services',
    'Maintenance & Support',
    'Custom Software Solutions'
  ];

  const mockUser: User = {
    id: 1,
    email: 'user@test.com',
    username: 'testuser',
    password: '$2b$10$hashedpassword123', 
    userType: UserType.CLIENT,
    isAccountVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordTokenExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sessions: []
  };

  const mockClient: Client = {
    id: 1,
    userId: 1,
    company_name: 'Test Company',
    contact_email: 'user@test.com',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSession: Session = {
    id: 1,
    userId: 1,
    refreshToken: 'refresh-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: {},
    createdAt: new Date(),
    user: mockUser
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: MailsService,
          useValue: mockMailsService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    sessionRepository = module.get<Repository<Session>>(getRepositoryToken(Session));
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    mailsService = module.get<MailsService>(MailsService);

  
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET_KEY: 'test-secret',
        JWT_ACCESS_EXPIRE_TIME: '1h',
        JWT_REFRESH_SECRET_KEY: 'test-refresh-secret',
        JWT_REFRESH_EXPIRE_TIME: '7d'
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'user@test.com',
      password: 'password123',
      username: 'testuser',
      company_name: 'Test Company'
    };

    it('should register user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockClientRepository.create.mockReturnValue(mockClient);
      mockClientRepository.save.mockResolvedValue(mockClient);
      mockMailsService.confirmRegisterUser.mockResolvedValue(undefined);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const result = await service.register(registerDto);

      expect(result.message).toBe('Registration successful, please verify your email');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        username: registerDto.username,
        userType: UserType.CLIENT,
        isAccountVerified: false
      }));
      expect(mockClientRepository.create).toHaveBeenCalledWith({
        company_name: registerDto.company_name,
        contact_email: registerDto.email,
        userId: mockUser.id
      });
      expect(mockMailsService.confirmRegisterUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException for existing user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto))
        .rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@test.com',
      password: 'password123'
    };

    const deviceInfo: DeviceInfo = {
      userAgent: 'test-agent',
      ip: '127.0.0.1'
    };

    it('should login user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(loginDto, deviceInfo);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(mockSessionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockUser.id,
        deviceInfo
      }));
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto))
        .rejects.toThrow('Invalid email or password');
    });

    it('should return verification message for unverified user', async () => {
      const unverifiedUser = { ...mockUser, isAccountVerified: false };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      mockUserRepository.save.mockResolvedValue(unverifiedUser);
      mockMailsService.confirmRegisterUser.mockResolvedValue(undefined);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(loginDto, deviceInfo);

      expect(result.message).toBe('Please verify your email to continue');
      expect(mockMailsService.confirmRegisterUser).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const payload = {
      id: 1,
      userType: UserType.CLIENT,
      sessionId: 1
    };

    it('should refresh token successfully', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockJwtService.verifyAsync.mockResolvedValue({});
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.refreshToken(payload);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sessionId, userId: payload.id }
      });
    });

    it('should throw UnauthorizedException for invalid session', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(payload))
        .rejects.toThrow('Invalid session');
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const expiredSession = { ...mockSession, expiresAt: new Date(Date.now() - 1000) };
      mockSessionRepository.findOne.mockResolvedValue(expiredSession);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await expect(service.refreshToken(payload))
        .rejects.toThrow('Session expired');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';
      const userWithToken = { ...mockUser, emailVerificationToken: token };
      mockUserRepository.findOne.mockResolvedValue(userWithToken);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.verifyEmail(token);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.message).toBe('Email verified successfully');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { emailVerificationToken: token } });
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token'))
        .rejects.toThrow('Invalid verification token');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockSessionRepository.remove.mockResolvedValue(mockSession);

      const result = await service.logout(1, 1);

      expect(result.message).toBe('Logged out successfully');
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1, id: 1 } });
      expect(mockSessionRepository.remove).toHaveBeenCalledWith(mockSession);
    });

    it('should throw BadRequestException for session not found', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(1, 1))
        .rejects.toThrow('Session not found');
    });
  });

  describe('logoutAllDevices', () => {
    it('should logout from all devices successfully', async () => {
      mockSessionRepository.delete.mockResolvedValue(undefined);

      const result = await service.logoutAllDevices(1);

      expect(result.message).toBe('Logged out from all devices successfully');
      expect(mockSessionRepository.delete).toHaveBeenCalledWith({ userId: 1 });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'user@test.com'
    };

    it('should send password reset email successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMailsService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toBe('Password reset code sent to your email');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: forgotPasswordDto.email } });
      expect(mockMailsService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException for user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto))
        .rejects.toThrow('User not found');
    });
  });

  describe('verifyResetCode', () => {
    const verifyResetCodeDto: VerifyResetCodeDto = {
      code: 'reset-code'
    };

    it('should verify reset code successfully', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'reset-code',
        resetPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
      };
      mockUserRepository.findOne.mockResolvedValue(userWithResetToken);

      const result = await service.verifyResetCode(verifyResetCodeDto);

      expect(result.message).toBe('Reset code is valid');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { resetPasswordToken: verifyResetCodeDto.code } });
    });

    it('should throw BadRequestException for invalid reset code', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyResetCode(verifyResetCodeDto))
        .rejects.toThrow('Invalid reset code');
    });

    it('should throw BadRequestException for expired reset code', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        resetPasswordToken: 'reset-code',
        resetPasswordTokenExpiresAt: new Date(Date.now() - 1000)
      };
      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(service.verifyResetCode(verifyResetCodeDto))
        .rejects.toThrow('Reset code has expired');
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      code: 'reset-code',
      password: 'newpassword123'
    };

    it('should reset password successfully', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'reset-code',
        resetPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
      };
      mockUserRepository.findOne.mockResolvedValue(userWithResetToken);
      mockUserRepository.save.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toBe('Password reset successfully');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { resetPasswordToken: resetPasswordDto.code } });
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null
      }));
    });

    it('should throw BadRequestException for invalid reset code', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto))
        .rejects.toThrow('Invalid reset code');
    });

    it('should throw BadRequestException for expired reset code', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        resetPasswordToken: 'reset-code',
        resetPasswordTokenExpiresAt: new Date(Date.now() - 1000)
      };
      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(resetPasswordDto))
        .rejects.toThrow('Reset code has expired');
    });
  });
});
