// src\utils\dtos.spec.ts

import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { CreateConceptosGastosDto } from '../conceptos_gastos/dto/create-conceptos_gastos.dto';
import { UpdateConceptosGastosDto } from '../conceptos_gastos/dto/update-conceptos_gastos.dto';
import { CreateConceptosIngresosDto } from '../conceptos_ingresos/dto/create-conceptos_ingresos.dto';
import { UpdateFondoEmergenciaDto } from '../fondo_emergencia/dto/update-fondo_emergencia.dto';
import { CreateFuentesGastosDto } from '../fuentes_gastos/dto/create-fuentes_gastos.dto';
import { UpdateFuentesIngresosDto } from '../fuentes_ingresos/dto/update-fuentes_ingresos.dto';
import { CopiarPeriodoDto } from './copiar-periodo.dto';
import { QueryPeriodoDto } from './query.dto';

const validationPipe = new ValidationPipe({ transform: true, whitelist: true });

const validarBody = async (metatype: Type, body: object) =>
  (await validationPipe.transform(body, { type: 'body', metatype })) as Record<
    string,
    unknown
  >;

const conceptoGastoValido = {
  id_fuente_gasto: '64b7f0c2a1b2c3d4e5f60718',
  periodo: '2026-06',
  monto: 100,
};

describe('DTOs con el ValidationPipe global', () => {
  describe('descarte de campos no declarados', () => {
    it('descarta sub y $set del body de un concepto de gasto', async () => {
      const dto = await validarBody(CreateConceptosGastosDto, {
        ...conceptoGastoValido,
        sub: 'auth0|otro-usuario',
        $set: { sub: 'auth0|otro-usuario' },
      });

      expect(dto).not.toHaveProperty('sub');
      expect(dto).not.toHaveProperty('$set');
      expect(dto).toMatchObject(conceptoGastoValido);
    });

    it('descarta sub y $set en los DTOs de actualización', async () => {
      const dto = await validarBody(UpdateConceptosGastosDto, {
        monto: 50,
        sub: 'auth0|otro-usuario',
        $set: { sub: 'auth0|otro-usuario' },
      });

      expect(dto).toEqual({ monto: 50 });
    });

    it('descarta sub y $set del body del fondo de emergencia', async () => {
      const dto = await validarBody(UpdateFondoEmergenciaDto, {
        monto_pesos: 10,
        sub: 'auth0|otro-usuario',
        $set: { sub: 'auth0|otro-usuario' },
      });

      expect(dto).toEqual({ monto_pesos: 10 });
    });
  });

  describe('formato de período', () => {
    it.each(['2026-6', '2026-13', '2026-00', '26-06', '2026/06', 'junio'])(
      'rechaza el período %s',
      async (periodo) => {
        await expect(
          validarBody(CreateConceptosIngresosDto, {
            id_fuente_ingreso: '64b7f0c2a1b2c3d4e5f60718',
            periodo,
            valor: 100,
          }),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it('acepta y recorta espacios en un período válido', async () => {
      const dto = await validarBody(CreateConceptosIngresosDto, {
        id_fuente_ingreso: '64b7f0c2a1b2c3d4e5f60718',
        periodo: ' 2026-12 ',
        valor: 100,
      });

      expect(dto.periodo).toBe('2026-12');
    });

    it.each(['2026-13', '2026-1', ''])(
      'CopiarPeriodoDto rechaza el período destino %p',
      async (periodo_destino) => {
        await expect(
          validarBody(CopiarPeriodoDto, { periodo_destino }),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it('CopiarPeriodoDto acepta un período destino válido', async () => {
      await expect(
        validarBody(CopiarPeriodoDto, { periodo_destino: '2026-01' }),
      ).resolves.toEqual({ periodo_destino: '2026-01' });
    });

    it('QueryPeriodoDto rechaza un período inválido en el query', async () => {
      await expect(
        validationPipe.transform(
          { periodo: '2026-13' },
          { type: 'query', metatype: QueryPeriodoDto },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('formato de color', () => {
    it.each(['#FFF', '#GGGGGG', 'FF0000', '#FF00000', 'rojo'])(
      'rechaza el color %s',
      async (color) => {
        await expect(
          validarBody(CreateFuentesGastosDto, { nombre: 'Luz', color }),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it.each(['#ff0000', '#FF0000AA'])('acepta el color %s', async (color) => {
      await expect(
        validarBody(CreateFuentesGastosDto, { nombre: 'Luz', color }),
      ).resolves.toMatchObject({ color });
    });

    it('los DTOs de actualización heredan la validación del color', async () => {
      await expect(
        validarBody(UpdateFuentesIngresosDto, { color: '#FFF' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sentinela -1 en conceptos de gasto', () => {
    it('acepta -1 como porcentaje_total', async () => {
      await expect(
        validarBody(CreateConceptosGastosDto, {
          ...conceptoGastoValido,
          porcentaje_total: -1,
        }),
      ).resolves.toMatchObject({ porcentaje_total: -1 });
    });

    it.each([-2, -0.5, 101])(
      'rechaza %p como porcentaje_total',
      async (porcentaje_total) => {
        await expect(
          validarBody(CreateConceptosGastosDto, {
            ...conceptoGastoValido,
            porcentaje_total,
          }),
        ).rejects.toThrow(BadRequestException);
      },
    );
  });
});
