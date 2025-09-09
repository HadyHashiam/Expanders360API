import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JWTPayLoadType, DeviceInfo } from '../../utils/types/types';
import { CurrentUser } from '../users/decorators/user.decorator';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeviceInfo as DeviceInfoDecorator } from '../users/decorators/device-info.decorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // POST /api/v1/auth/register
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // 201
  public async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  // POST /api/v1/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK) // 200
  public async login(@Body() body: LoginDto, @DeviceInfoDecorator() deviceInfo:DeviceInfo) {
    return this.authService.login(body, deviceInfo);
  }

  // POST /api/v1/auth/refreshToken
  @Post('refreshToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async refreshToken(@CurrentUser() payload: JWTPayLoadType) {
    return this.authService.refreshToken(payload);
  }

  // POST /api/v1/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async logout(@CurrentUser() payload: JWTPayLoadType) {
    return this.authService.logout(payload.id, payload.sessionId);
  }

  // POST /api/v1/auth/logoutAllDevices
  @Post('logoutAllDevices')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public async logoutAllDevices(@CurrentUser() payload: JWTPayLoadType) {
    return this.authService.logoutAllDevices(payload.id);
  }

  // GET /api/v1/auth/verify-email/:token
  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK) // 200
  public async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // POST /api/v1/auth/forgotPassword
  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK) // 200
  public async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  // POST /api/v1/auth/verifyResetCode
  @Post('verifyResetCode')
  @HttpCode(HttpStatus.OK) // 200
  public async verifyResetCode(@Body() body: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(body);
  }

  // POST /api/v1/auth/resetPassword
  @Post('resetPassword')
  @HttpCode(HttpStatus.OK) // 200
  public async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}