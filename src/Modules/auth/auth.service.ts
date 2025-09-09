import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayLoadType, TokenPair, DeviceInfo } from '../../utils/types/types';
import { Session } from '../session/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { MailsService } from '../mails/mails.service';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserType } from '../../utils/enums';
import { Client } from '../users/clients/entities/client.entity';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailsService: MailsService,
  ) {}

  private async generateTokens(
    payload: JWTPayLoadType,
  ): Promise<TokenPair> {
    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE_TIME'),
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_TIME'),
      });
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Failed to generate tokens: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(`Failed to hash password: ${error.message}`);
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  public async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string }> {
    const { email, password, username, company_name } = registerDto;

    try {
      const userFromDb = await this.userRepository.findOne({ where: { email } });
      if (userFromDb) {
        this.logger.warn(`User already exists: ${email}`);
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await this.hashPassword(password);
      const emailVerificationToken = uuidv4();
      const newUser = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
        emailVerificationToken,
        isAccountVerified: false,
        userType: UserType.CLIENT,
      });
      const user = await this.userRepository.save(newUser);

      const newClient = this.clientRepository.create({
        company_name,
        contact_email: email,
        userId: user.id,
      });
      await this.clientRepository.save(newClient);

      this.logger.log(`Sending verification email to: ${email}`);
      await this.mailsService.confirmRegisterUser(user.email, emailVerificationToken);

      return { message: 'Registration successful, please verify your email' };
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  public async login(
    loginDto: LoginDto,
    deviceInfo?: DeviceInfo,
  ): Promise<{ accessToken?: string; refreshToken?: string; user?: User; message?: string }> {
    const { email, password } = loginDto;

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new BadRequestException('Invalid email or password');

      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (!isPasswordMatched) throw new BadRequestException('Invalid email or password');

      if (!user.isAccountVerified) {
        const emailVerificationToken = user.emailVerificationToken || uuidv4();
        user.emailVerificationToken = emailVerificationToken;
        await this.userRepository.save(user);
        await this.mailsService.confirmRegisterUser(user.email, emailVerificationToken);
        return { message: 'Please verify your email to continue' };
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const session = this.sessionRepository.create({
        userId: user.id,
        refreshToken: '',
        expiresAt,
        deviceInfo: deviceInfo || {},
      });
      const savedSession = await this.sessionRepository.save(session);

      const { accessToken, refreshToken } = await this.generateTokens({
        id: user.id,
        userType: user.userType,
        sessionId: savedSession.id,
      });

      savedSession.refreshToken = refreshToken;
      await this.sessionRepository.save(savedSession);

      return { user, accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Failed to login user: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to login user');
    }
  }

  public async refreshToken(payload: JWTPayLoadType): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const session = await this.sessionRepository.findOne({ where: { id: payload.sessionId, userId: payload.id } });
       if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.delete({ id: session.id });
      throw new UnauthorizedException('Session expired');
    }


      await this.jwtService.verifyAsync(session.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      });

      const newTokens = await this.generateTokens({
        id: payload.id,
        userType: payload.userType,
        sessionId: session.id,
      });

      session.refreshToken = newTokens.refreshToken;
      session.expiresAt = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
      await this.sessionRepository.save(session);

      return newTokens;
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  public async verifyEmail(token: string): Promise<{ accessToken: string; refreshToken: string; user: User; message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { emailVerificationToken: token } });
      if (!user) throw new BadRequestException('Invalid verification token');

      user.isAccountVerified = true;
      user.emailVerificationToken = null;
      await this.userRepository.save(user);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const session = this.sessionRepository.create({
        userId: user.id,
        refreshToken: '',
        expiresAt,
      });
      const savedSession = await this.sessionRepository.save(session);

      const { accessToken, refreshToken } = await this.generateTokens({
        id: user.id,
        userType: user.userType,
        sessionId: savedSession.id,
      });

      savedSession.refreshToken = refreshToken;
      await this.sessionRepository.save(savedSession);

      return { user, accessToken, refreshToken, message: 'Email verified successfully' };
    } catch (error) {
      this.logger.error(`Failed to verify email: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  public async logout(userId: number, sessionId: number): Promise<{ message: string }> {
    try {
      const session = await this.sessionRepository.findOne({ where: { userId, id: sessionId } });
      if (!session) throw new BadRequestException('Session not found');

      await this.sessionRepository.remove(session);
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Failed to logout: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  public async logoutAllDevices(userId: number): Promise<{ message: string }> {
    try {
      await this.sessionRepository.delete({ userId });
      return { message: 'Logged out from all devices successfully' };
    } catch (error) {
      this.logger.error(`Failed to logout all devices: ${error.message}`);
      throw new InternalServerErrorException('Failed to logout from all devices');
    }
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const { email } = forgotPasswordDto;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new BadRequestException('User not found');

      const resetPasswordToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordTokenExpiresAt = expiresAt;
      await this.userRepository.save(user);

      await this.mailsService.sendPasswordResetEmail(user.email, resetPasswordToken);

      return { message: 'Password reset code sent to your email' };
    } catch (error) {
      this.logger.error(`Failed to process forgot password: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to process forgot password');
    }
  }

  public async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto): Promise<{ message: string }> {
    try {
      const { code } = verifyResetCodeDto;
      const user = await this.userRepository.findOne({ where: { resetPasswordToken: code } });
      if (!user) throw new BadRequestException('Invalid reset code');

      if (user.resetPasswordTokenExpiresAt! < new Date()) {
        throw new BadRequestException('Reset code has expired');
      }

      return { message: 'Reset code is valid' };
    } catch (error) {
      this.logger.error(`Failed to verify reset code: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify reset code');
    }
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const { code, password } = resetPasswordDto;
      const user = await this.userRepository.findOne({ where: { resetPasswordToken: code } });
      if (!user) throw new BadRequestException('Invalid reset code');

      if (user.resetPasswordTokenExpiresAt! < new Date()) {
        throw new BadRequestException('Reset code has expired');
      }

      user.password = await this.hashPassword(password);
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiresAt = null;
      await this.userRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error(`Failed to reset password: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}