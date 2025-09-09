import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserType } from '../../utils/enums';
import { JWTPayLoadType, DeviceInfo } from '../../utils/types/types';
import { JwtAuthGuard } from './guards/JwtAuthGuard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAllDevices: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    verifyResetCode: jest.fn(),
    resetPassword: jest.fn()
  };

  const mockPayload: JWTPayLoadType = {
    id: 1,
    userType: UserType.CLIENT,
    sessionId: 1
  };

  const mockDeviceInfo: DeviceInfo = {
    userAgent: 'test-agent',
    ip: '127.0.0.1'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'user@test.com',
        password: 'password123',
        username: 'testuser',
        company_name: 'Test Company'
      };

      const expectedResult = { message: 'Registration successful, please verify your email' };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'user@test.com',
        password: 'password123'
      };

      const expectedResult = {
        user: { id: 1, email: 'user@test.com', username: 'testuser' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockDeviceInfo);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, mockDeviceInfo);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const expectedResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockPayload);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const expectedResult = { message: 'Logged out successfully' };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockPayload.id, mockPayload.sessionId);
    });
  });

  describe('logoutAllDevices', () => {
    it('should logout from all devices successfully', async () => {
      const expectedResult = { message: 'Logged out from all devices successfully' };

      mockAuthService.logoutAllDevices.mockResolvedValue(expectedResult);

      const result = await controller.logoutAllDevices(mockPayload);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logoutAllDevices).toHaveBeenCalledWith(mockPayload.id);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';
      const expectedResult = {
        user: { id: 1, email: 'user@test.com', username: 'testuser' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        message: 'Email verified successfully'
      };

      mockAuthService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(token);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'user@test.com'
      };

      const expectedResult = { message: 'Password reset code sent to your email' };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('verifyResetCode', () => {
    it('should verify reset code successfully', async () => {
      const verifyResetCodeDto: VerifyResetCodeDto = {
        code: 'reset-code'
      };

      const expectedResult = { message: 'Reset code is valid' };

      mockAuthService.verifyResetCode.mockResolvedValue(expectedResult);

      const result = await controller.verifyResetCode(verifyResetCodeDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith(verifyResetCodeDto);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        code: 'reset-code',
        password: 'newpassword123'
      };

      const expectedResult = { message: 'Password reset successfully' };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
