// src\main.ts

import { AppModule } from './app.module';
import { auth } from 'express-oauth2-jwt-bearer';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const audience = configService.get<string>('BACKEND_URL');
  const issuerBaseURL = configService.get<string>('ISSUER_BASE_URL');

  const front1 = configService.get<string>('FRONT_1');
  const front2 = configService.get<string>('FRONT_2');

  app.enableCors({
    origin: [front1, front2].filter(Boolean),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const jwtCheck = auth({
    audience,
    issuerBaseURL,
    tokenSigningAlg: 'RS256',
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    jwtCheck(req, res, next);
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
