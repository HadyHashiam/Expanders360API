import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserType } from '../../../utils/enums';
import { JWTPayLoadType } from '../../../utils/types/types';
import { CURRENT_USER_KEY } from '../../../utils/constant';

// verify user roles from payload
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: UserType[] = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return false;
    }

    const request: Request = context.switchToHttp().getRequest();
    const rawAuth = (request.headers.authorization || '').trim();
    const [type, ...rest] = rawAuth.split(/\s+/);
    const token = rest.join(' ');

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException('Access denied, no token provided');
    }

    try {
      const payload: JWTPayLoadType = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      if (roles.includes(payload.userType)) {
        request[CURRENT_USER_KEY] = payload;
        return true;
      }
      throw new UnauthorizedException('Access denied, insufficient permissions');
    } catch (error) {
      throw new UnauthorizedException('Access denied, invalid token');
    }
  }
}