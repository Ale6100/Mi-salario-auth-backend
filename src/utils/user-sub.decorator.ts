// src\utils\user-sub.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * En desarrollo el token no se valida (ver main.ts), así que el sub se lee
 * del payload sin verificar la firma. Nunca se usa fuera de ese modo.
 */
const readSubWithoutVerifyingToken = (
  authorization?: string,
): string | undefined => {
  const payload = authorization?.replace(/^Bearer /, '').split('.')[1];
  if (!payload) return undefined;

  try {
    const { sub } = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as { sub?: unknown };
    return typeof sub === 'string' ? sub : undefined;
  } catch {
    return undefined;
  }
};

export const UserSub = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();

    const sub =
      request.auth?.payload.sub ??
      (process.env.NODE_ENV === 'development'
        ? readSubWithoutVerifyingToken(request.headers.authorization)
        : undefined);

    if (!sub) {
      throw new UnauthorizedException('No se pudo identificar al usuario');
    }

    return sub;
  },
);
