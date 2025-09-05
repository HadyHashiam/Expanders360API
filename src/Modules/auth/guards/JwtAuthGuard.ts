import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JWTPayLoadType } from '../../../utils/types';
import { CURRENT_USER_KEY } from '../../../utils/constant';
;

// Guard to verify JWT access token
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException('Access denied, no token provided');
    }

    try {
      const payload: JWTPayLoadType = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });
      request[CURRENT_USER_KEY] = payload;
      return true;
    } catch (error) {
      // Allow expired token for refreshToken endpoint
      if (request.url.includes('/refreshToken')) {
        try {
          const payload: JWTPayLoadType = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_SECRET_KEY'),
            ignoreExpiration: true,
          });
          request[CURRENT_USER_KEY] = payload;
          return true;
        } catch (err) {
          throw new UnauthorizedException('Access denied, invalid token');
        }
      }
      throw new UnauthorizedException('Access denied, invalid or expired token');
    }
  }
}