// src\conceptos_gastos\conceptos_gastos.service.spec.ts

import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import { FuentesGastos } from '../fuentes_gastos/schema/fuentes_gastos.schema';
import {
  createModelMock,
  ModelMock,
  queryResult,
} from '../test-utils/mongoose-model.mock';
import { ConceptosGastosService } from './conceptos_gastos.service';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { ConceptosGastos } from './schema/conceptos_gastos.schema';

type ConceptoGastoGuardado = Partial<ConceptosGastos> & { periodo: string };

const conceptoGuardado = (datos: ConceptoGastoGuardado) => ({
  ...datos,
  toObject: () => ({ ...datos }),
});

describe('ConceptosGastosService', () => {
  const sub = 'auth0|usuario-a';
  const id = new Types.ObjectId();
  const idFuente = new Types.ObjectId();

  let service: ConceptosGastosService;
  let conceptosGastosModel: ModelMock;
  let conceptosIngresosModel: ModelMock;
  let fuentesGastosModel: ModelMock;

  beforeEach(async () => {
    conceptosGastosModel = createModelMock();
    conceptosIngresosModel = createModelMock();
    fuentesGastosModel = createModelMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ConceptosGastosService,
        {
          provide: getModelToken(ConceptosGastos.name),
          useValue: conceptosGastosModel,
        },
        {
          provide: getModelToken(ConceptosIngresos.name),
          useValue: conceptosIngresosModel,
        },
        {
          provide: getModelToken(FuentesGastos.name),
          useValue: fuentesGastosModel,
        },
      ],
    }).compile();

    service = moduleRef.get(ConceptosGastosService);
  });

  describe('findAllBySub', () => {
    it('filtra los gastos y los ingresos usados para el cálculo por el sub del usuario', async () => {
      conceptosGastosModel.find.mockReturnValue(
        queryResult([conceptoGuardado({ periodo: '2026-06', monto: 100 })]),
      );
      conceptosIngresosModel.find.mockReturnValue(queryResult([]));

      await service.findAllBySub({ sub, periodo: '2026-06' });

      expect(conceptosGastosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-06',
      });
      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: { $in: ['2026-06'] },
      });
    });

    it('sin período no agrega el filtro de período', async () => {
      conceptosGastosModel.find.mockReturnValue(queryResult([]));
      conceptosIngresosModel.find.mockReturnValue(queryResult([]));

      await service.findAllBySub({ sub });

      expect(conceptosGastosModel.find).toHaveBeenCalledWith({ sub });
    });

    it('calcula el monto a partir del porcentaje de los ingresos de su mismo período', async () => {
      conceptosGastosModel.find.mockReturnValue(
        queryResult([
          conceptoGuardado({
            periodo: '2026-06',
            monto: -1,
            porcentaje_total: 10,
          }),
          conceptoGuardado({
            periodo: '2026-07',
            monto: -1,
            porcentaje_total: 50,
          }),
        ]),
      );
      conceptosIngresosModel.find.mockReturnValue(
        queryResult([
          { periodo: '2026-06', valor: 1500 },
          { periodo: '2026-06', valor: 500 },
          { periodo: '2026-07', valor: 300 },
        ]),
      );

      const resultado = await service.findAllBySub({ sub });

      expect(resultado.map((c) => c.monto)).toEqual([200, 150]);
    });

    it('respeta el monto fijo aunque también haya porcentaje', async () => {
      conceptosGastosModel.find.mockReturnValue(
        queryResult([
          conceptoGuardado({
            periodo: '2026-06',
            monto: 80,
            porcentaje_total: 10,
          }),
        ]),
      );
      conceptosIngresosModel.find.mockReturnValue(
        queryResult([{ periodo: '2026-06', valor: 1000 }]),
      );

      const [concepto] = await service.findAllBySub({ sub });

      expect(concepto.monto).toBe(80);
    });

    it('devuelve monto 0 si monto y porcentaje son ambos -1 o no están definidos', async () => {
      conceptosGastosModel.find.mockReturnValue(
        queryResult([
          conceptoGuardado({
            periodo: '2026-06',
            monto: -1,
            porcentaje_total: -1,
          }),
          conceptoGuardado({ periodo: '2026-06' }),
        ]),
      );
      conceptosIngresosModel.find.mockReturnValue(
        queryResult([{ periodo: '2026-06', valor: 1000 }]),
      );

      const resultado = await service.findAllBySub({ sub });

      expect(resultado.map((c) => c.monto)).toEqual([0, 0]);
    });

    it('devuelve monto 0 por porcentaje si el período no tiene ingresos', async () => {
      conceptosGastosModel.find.mockReturnValue(
        queryResult([
          conceptoGuardado({
            periodo: '2026-06',
            monto: -1,
            porcentaje_total: 10,
          }),
        ]),
      );
      conceptosIngresosModel.find.mockReturnValue(queryResult([]));

      const [concepto] = await service.findAllBySub({ sub });

      expect(concepto.monto).toBe(0);
    });
  });

  describe('createBySource', () => {
    const createConceptosGastosDto: CreateConceptosGastosDto = {
      id_fuente_gasto: idFuente.toString(),
      periodo: '2026-06',
      monto: 100,
      porcentaje_total: -1,
    };

    it('crea el concepto con el sub del usuario si la fuente es suya', async () => {
      fuentesGastosModel.exists.mockReturnValue(queryResult({ _id: idFuente }));

      await service.createBySource({ sub, createConceptosGastosDto });

      expect(fuentesGastosModel.exists).toHaveBeenCalledWith({
        _id: createConceptosGastosDto.id_fuente_gasto,
        sub,
      });
      expect(conceptosGastosModel).toHaveBeenCalledWith({
        ...createConceptosGastosDto,
        sub,
      });
    });

    it('lanza NotFoundException y no crea nada si la fuente es de otro usuario', async () => {
      fuentesGastosModel.exists.mockReturnValue(queryResult(null));

      await expect(
        service.createBySource({ sub, createConceptosGastosDto }),
      ).rejects.toThrow(NotFoundException);
      expect(conceptosGastosModel).not.toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('filtra por id y sub y corre los validadores del schema', async () => {
      const actualizado = { monto: 50 };
      conceptosGastosModel.findOneAndUpdate.mockReturnValue(
        queryResult(actualizado),
      );
      const updateConceptosGastosDto = { monto: 50 };

      await expect(
        service.updateById({ sub, id, updateConceptosGastosDto }),
      ).resolves.toBe(actualizado);
      expect(fuentesGastosModel.exists).not.toHaveBeenCalled();
      expect(conceptosGastosModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, sub },
        updateConceptosGastosDto,
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('verifica que la nueva fuente sea del usuario antes de actualizar', async () => {
      fuentesGastosModel.exists.mockReturnValue(queryResult(null));

      await expect(
        service.updateById({
          sub,
          id,
          updateConceptosGastosDto: { id_fuente_gasto: idFuente.toString() },
        }),
      ).rejects.toThrow(NotFoundException);
      expect(fuentesGastosModel.exists).toHaveBeenCalledWith({
        _id: idFuente.toString(),
        sub,
      });
      expect(conceptosGastosModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el concepto no es del usuario', async () => {
      conceptosGastosModel.findOneAndUpdate.mockReturnValue(queryResult(null));

      await expect(
        service.updateById({ sub, id, updateConceptosGastosDto: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('patchPagadoById', () => {
    it('marca el concepto como pagado filtrando por id y sub', async () => {
      conceptosGastosModel.findOneAndUpdate.mockReturnValue(
        queryResult({ pagado: true }),
      );

      await service.patchPagadoById({
        sub,
        id,
        patchPagadoConceptosGastosDto: { monto: 30, aclaracion: 'Con recargo' },
      });

      expect(conceptosGastosModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, sub },
        { monto: 30, aclaracion: 'Con recargo', pagado: true },
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('lanza NotFoundException si el concepto no es del usuario', async () => {
      conceptosGastosModel.findOneAndUpdate.mockReturnValue(queryResult(null));

      await expect(
        service.patchPagadoById({
          sub,
          id,
          patchPagadoConceptosGastosDto: {},
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('borra filtrando por id y sub', async () => {
      const eliminado = { _id: id };
      conceptosGastosModel.findOneAndDelete.mockReturnValue(
        queryResult(eliminado),
      );

      await expect(service.deleteById({ sub, id })).resolves.toBe(eliminado);
      expect(conceptosGastosModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: id,
        sub,
      });
    });

    it('lanza NotFoundException si el concepto no es del usuario', async () => {
      conceptosGastosModel.findOneAndDelete.mockReturnValue(queryResult(null));

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('copiarDelPeriodoAnterior', () => {
    const idAlquiler = new Types.ObjectId();
    const idLuz = new Types.ObjectId();

    const mockConceptosPorPeriodo = (
      conceptosPorPeriodo: Record<string, Partial<ConceptosGastos>[]>,
    ) => {
      conceptosGastosModel.find.mockImplementation(
        ({ periodo }: { periodo: string }) =>
          queryResult(conceptosPorPeriodo[periodo] ?? []),
      );
    };

    it('copia los conceptos del mes anterior del usuario sin pagado ni aclaración', async () => {
      mockConceptosPorPeriodo({
        '2026-05': [
          {
            id_fuente_gasto: idAlquiler,
            periodo: '2026-05',
            monto: 1000,
            porcentaje_total: -1,
            pagado: true,
            aclaracion: 'Pagado con tarjeta',
          },
        ],
      });

      const copiados = await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(conceptosGastosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-05',
      });
      expect(conceptosGastosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-06',
      });
      expect(copiados).toEqual([
        {
          sub,
          id_fuente_gasto: idAlquiler,
          periodo: '2026-06',
          monto: 1000,
          porcentaje_total: -1,
        },
      ]);
    });

    it('si el concepto usa porcentaje lo copia con monto -1 para no arrastrar el monto pagado', async () => {
      mockConceptosPorPeriodo({
        '2026-05': [
          {
            id_fuente_gasto: idLuz,
            monto: 350,
            porcentaje_total: 10,
            pagado: true,
          },
        ],
      });

      const copiados = await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(copiados).toEqual([
        {
          sub,
          id_fuente_gasto: idLuz,
          periodo: '2026-06',
          monto: -1,
          porcentaje_total: 10,
        },
      ]);
    });

    it('omite las fuentes que ya tienen un concepto en el período destino', async () => {
      mockConceptosPorPeriodo({
        '2026-05': [
          { id_fuente_gasto: idAlquiler, monto: 1000 },
          { id_fuente_gasto: idLuz, monto: 200 },
        ],
        '2026-06': [{ id_fuente_gasto: new Types.ObjectId(idLuz.toString()) }],
      });

      await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(conceptosGastosModel.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ id_fuente_gasto: idAlquiler }),
      ]);
    });

    it('en enero copia desde diciembre del año anterior', async () => {
      mockConceptosPorPeriodo({});

      await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-01',
      });

      expect(conceptosGastosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2025-12',
      });
    });

    it('si el mes anterior no tiene conceptos no inserta ninguno', async () => {
      mockConceptosPorPeriodo({});

      await expect(
        service.copiarDelPeriodoAnterior({ sub, periodoDestino: '2026-06' }),
      ).resolves.toEqual([]);
      expect(conceptosGastosModel.insertMany).toHaveBeenCalledWith([]);
    });
  });
});
