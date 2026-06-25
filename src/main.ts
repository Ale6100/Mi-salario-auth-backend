import { NestFactory } from '@nestjs/core';
import { auth } from 'express-oauth2-jwt-bearer';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  const audience = configService.get<string>('BACKEND_URL');
  const issuerBaseURL = configService.get<string>('ISSUER_BASE_URL');

  if (isProduction) {
    const jwtCheck = auth({
      audience,
      issuerBaseURL,
      tokenSigningAlg: 'RS256',
    });

    app.use(jwtCheck);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => console.log(`Server running on port ${process.env.PORT ?? 3000}`))
  .catch((error) => {
    console.error('Error starting the server:', error);
  });
