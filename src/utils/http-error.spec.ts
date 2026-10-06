// src\utils\http-error.spec.ts

import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { toHttpException } from './http-error';

describe('toHttpException', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve la misma HttpException que recibe', () => {
    const error = new NotFoundException('No se encontró la fuente');

    expect(toHttpException(error, 'Mensaje genérico')).toBe(error);
  });

  it('convierte cualquier otro error en un 500 con el mensaje genérico sin exponer el original', () => {
    const error = new Error('connection refused mongodb://usuario:clave@host');

    const httpException = toHttpException(error, 'Mensaje genérico');

    expect(httpException).toBeInstanceOf(InternalServerErrorException);
    expect(httpException.getStatus()).toBe(500);
    expect(httpException.message).toBe('Mensaje genérico');
    expect(JSON.stringify(httpException.getResponse())).not.toContain(
      'mongodb://',
    );
  });
});
