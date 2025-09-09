import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Configuring JWT settings for access token
export const jwtConfig = (config: ConfigService): JwtModuleOptions => {
  const secret = config.get<string>('JWT_SECRET_KEY');
  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not defined in .env');
  }
  return {
    secret,
    signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRE_TIME') },
  };
};

// Configuring JWT settings for refresh token
export const refreshJwtConfig = (config: ConfigService): JwtModuleOptions => {
  const refreshSecret = config.get<string>('JWT_REFRESH_SECRET_KEY');
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET_KEY is not defined in .env');
  }
  return {
    secret: refreshSecret,
    signOptions: { expiresIn: config.get<string>('JWT_REFRESH_EXPIRE_TIME') },
  };
};