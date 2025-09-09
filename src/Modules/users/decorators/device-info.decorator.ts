import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return {
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'] || undefined,
    } as Record<string, any>;
  },
);


