// src\utils\user-sub.decorator.spec.ts

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { UserSub } from './user-sub.decorator';

type ParamDecoratorFactory = (
  data: unknown,
  context: ExecutionContext,
) => string;

type RequestSimulado = {
  auth?: { payload: { sub?: string } };
  headers: { authorization?: string };
};

const getUserSubFactory = (): ParamDecoratorFactory => {
  class ControllerDePrueba {
    handler(@UserSub() sub: string) {
      return sub;
    }
  }

  const args = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    ControllerDePrueba,
    'handler',
  ) as Record<string, { factory: ParamDecoratorFactory }>;

  return Object.values(args)[0].factory;
};

const contextoCon = (request: RequestSimulado) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const tokenSinFirmaCon = (payload: object) =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'firma',
  ].join('.');

describe('UserSub', () => {
  const factory = getUserSubFactory();
  const nodeEnvOriginal = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = nodeEnvOriginal;
  });

  it('devuelve el sub del token validado por el middleware de Auth0', () => {
    process.env.NODE_ENV = 'production';
    const request: RequestSimulado = {
      auth: { payload: { sub: 'auth0|validado' } },
      headers: {
        authorization: `Bearer ${tokenSinFirmaCon({ sub: 'auth0|otro' })}`,
      },
    };

    expect(factory(undefined, contextoCon(request))).toBe('auth0|validado');
  });

  it('fuera de development no lee el token sin verificar y lanza UnauthorizedException', () => {
    process.env.NODE_ENV = 'production';
    const request: RequestSimulado = {
      headers: {
        authorization: `Bearer ${tokenSinFirmaCon({ sub: 'auth0|falso' })}`,
      },
    };

    expect(() => factory(undefined, contextoCon(request))).toThrow(
      UnauthorizedException,
    );
  });

  it('sin NODE_ENV definido no lee el token sin verificar', () => {
    delete process.env.NODE_ENV;
    const request: RequestSimulado = {
      headers: {
        authorization: `Bearer ${tokenSinFirmaCon({ sub: 'auth0|falso' })}`,
      },
    };

    expect(() => factory(undefined, contextoCon(request))).toThrow(
      UnauthorizedException,
    );
  });

  describe('en development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('lee el sub del payload del Bearer sin verificar la firma', () => {
      const request: RequestSimulado = {
        headers: {
          authorization: `Bearer ${tokenSinFirmaCon({ sub: 'auth0|dev' })}`,
        },
      };

      expect(factory(undefined, contextoCon(request))).toBe('auth0|dev');
    });

    it.each([
      ['sin header Authorization', undefined],
      ['con un token sin payload', 'Bearer abc'],
      ['con un payload que no es JSON', 'Bearer abc.no-es-json.firma'],
      ['con un payload sin sub', `Bearer ${tokenSinFirmaCon({ name: 'Ana' })}`],
      ['con un sub que no es string', `Bearer ${tokenSinFirmaCon({ sub: 1 })}`],
    ])('lanza UnauthorizedException %s', (_caso, authorization) => {
      const request: RequestSimulado = { headers: { authorization } };

      expect(() => factory(undefined, contextoCon(request))).toThrow(
        UnauthorizedException,
      );
    });
  });
});
