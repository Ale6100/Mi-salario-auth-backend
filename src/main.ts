// src\main.ts

import { AppModule } from './app.module';
import { auth } from 'express-oauth2-jwt-bearer';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const audience = configService.get<string>('AUTH_AUDIENCE');
  const issuerBaseURL = configService.get<string>('AUTH_ISSUER_BASE_URL');

  const front1 = configService.get<string>('FRONT_1');
  const front2 = configService.get<string>('FRONT_2');

  app.enableCors({
    origin: [front1, front2].filter(Boolean),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  //* ----- Opcionalmente se puede comentar esto en desarrollo
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
  //* -----

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mi Salario Auth')
    .setDescription('Documentación de la API de Mi Salario Auth')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
