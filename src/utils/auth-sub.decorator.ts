// src\fuentes_ingreso\auth-sub.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const AuthSub = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.auth?.payload?.sub;
  },
);
