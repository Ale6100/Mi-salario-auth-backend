// src\utils\http-error.ts

import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const logger = new Logger('HttpError');

export const toHttpException = (
  error: unknown,
  fallbackMessage: string,
): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  logger.error(error);
  return new InternalServerErrorException(fallbackMessage);
};
