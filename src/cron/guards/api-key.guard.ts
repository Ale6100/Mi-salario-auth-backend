import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expectedApiKey = process.env.CRON_API_KEY;

    if (!expectedApiKey) {
      throw new UnauthorizedException(
        'CRON_API_KEY no configurada en el servidor',
      );
    }

    if (!apiKey) {
      throw new UnauthorizedException('Header X-API-Key requerido');
    }

    if (apiKey !== expectedApiKey) {
      throw new UnauthorizedException('X-API-Key inválida');
    }

    return true;
  }
}
