import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../../../utils/constant';
import { JWTPayLoadType } from '../../../utils/types/types';

// Decorator to inject current user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JWTPayLoadType => {
    const request = ctx.switchToHttp().getRequest();
    return request[CURRENT_USER_KEY];
  },
);