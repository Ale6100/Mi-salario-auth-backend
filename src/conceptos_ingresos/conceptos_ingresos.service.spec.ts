// src\conceptos_ingresos\conceptos_ingresos.service.spec.ts

import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { FuentesIngresos } from '../fuentes_ingresos/schema/fuentes_ingresos.schema';
import {
  createModelMock,
  ModelMock,
  queryResult,
} from '../test-utils/mongoose-model.mock';
import { ConceptosIngresosService } from './conceptos_ingresos.service';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { ConceptosIngresos } from './schema/conceptos_ingresos.schema';

describe('ConceptosIngresosService', () => {
  const sub = 'auth0|usuario-a';
  const id = new Types.ObjectId();
  const idFuente = new Types.ObjectId();

  let service: ConceptosIngresosService;
  let conceptosIngresosModel: ModelMock;
  let fuentesIngresosModel: ModelMock;

  beforeEach(async () => {
    conceptosIngresosModel = createModelMock();
    fuentesIngresosModel = createModelMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ConceptosIngresosService,
        {
          provide: getModelToken(ConceptosIngresos.name),
          useValue: conceptosIngresosModel,
        },
        {
          provide: getModelToken(FuentesIngresos.name),
          useValue: fuentesIngresosModel,
        },
      ],
    }).compile();

    service = moduleRef.get(ConceptosIngresosService);
  });

  describe('findAllBySub', () => {
    it('filtra por el sub del usuario y por el período si se envía', async () => {
      const query = queryResult([]);
      conceptosIngresosModel.find.mockReturnValue(query);

      await service.findAllBySub({ sub, periodo: '2026-06' });

      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-06',
      });
      expect(query.populate).toHaveBeenCalledWith('id_fuente_ingreso');
    });

    it('sin período filtra solo por el sub del usuario', async () => {
      conceptosIngresosModel.find.mockReturnValue(queryResult([]));

      await service.findAllBySub({ sub });

      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({ sub });
    });
  });

  describe('createBySource', () => {
    const createConceptosIngresosDto: CreateConceptosIngresosDto = {
      id_fuente_ingreso: idFuente.toString(),
      periodo: '2026-06',
      valor: 1000,
    };

    it('crea el concepto con el sub del usuario si la fuente es suya', async () => {
      fuentesIngresosModel.exists.mockReturnValue(
        queryResult({ _id: idFuente }),
      );

      await service.createBySource({ sub, createConceptosIngresosDto });

      expect(fuentesIngresosModel.exists).toHaveBeenCalledWith({
        _id: createConceptosIngresosDto.id_fuente_ingreso,
        sub,
      });
      expect(conceptosIngresosModel).toHaveBeenCalledWith({
        ...createConceptosIngresosDto,
        sub,
      });
    });

    it('lanza NotFoundException y no crea nada si la fuente es de otro usuario', async () => {
      fuentesIngresosModel.exists.mockReturnValue(queryResult(null));

      await expect(
        service.createBySource({ sub, createConceptosIngresosDto }),
      ).rejects.toThrow(NotFoundException);
      expect(conceptosIngresosModel).not.toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('filtra por id y sub y corre los validadores del schema', async () => {
      const actualizado = { valor: 2000 };
      conceptosIngresosModel.findOneAndUpdate.mockReturnValue(
        queryResult(actualizado),
      );
      const updateConceptosIngresosDto = { valor: 2000 };

      await expect(
        service.updateById({ sub, id, updateConceptosIngresosDto }),
      ).resolves.toBe(actualizado);
      expect(conceptosIngresosModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, sub },
        updateConceptosIngresosDto,
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('verifica que la nueva fuente sea del usuario antes de actualizar', async () => {
      fuentesIngresosModel.exists.mockReturnValue(queryResult(null));

      await expect(
        service.updateById({
          sub,
          id,
          updateConceptosIngresosDto: {
            id_fuente_ingreso: idFuente.toString(),
          },
        }),
      ).rejects.toThrow(NotFoundException);
      expect(fuentesIngresosModel.exists).toHaveBeenCalledWith({
        _id: idFuente.toString(),
        sub,
      });
      expect(conceptosIngresosModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el concepto no es del usuario', async () => {
      conceptosIngresosModel.findOneAndUpdate.mockReturnValue(
        queryResult(null),
      );

      await expect(
        service.updateById({ sub, id, updateConceptosIngresosDto: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('borra filtrando por id y sub', async () => {
      const eliminado = { _id: id };
      conceptosIngresosModel.findOneAndDelete.mockReturnValue(
        queryResult(eliminado),
      );

      await expect(service.deleteById({ sub, id })).resolves.toBe(eliminado);
      expect(conceptosIngresosModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: id,
        sub,
      });
    });

    it('lanza NotFoundException si el concepto no es del usuario', async () => {
      conceptosIngresosModel.findOneAndDelete.mockReturnValue(
        queryResult(null),
      );

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('copiarDelPeriodoAnterior', () => {
    const idSueldo = new Types.ObjectId();
    const idFreelance = new Types.ObjectId();
    const idAguinaldo = new Types.ObjectId();

    const mockConceptosPorPeriodo = (
      conceptosPorPeriodo: Record<string, Partial<ConceptosIngresos>[]>,
    ) => {
      conceptosIngresosModel.find.mockImplementation(
        ({ periodo }: { periodo: string }) =>
          queryResult(conceptosPorPeriodo[periodo] ?? []),
      );
    };

    const mockFuentesCopiables = (ids: Types.ObjectId[]) => {
      fuentesIngresosModel.find.mockReturnValue(
        queryResult(ids.map((_id) => ({ _id }))),
      );
    };

    it('consulta solo las fuentes activas y que no son aguinaldo del usuario', async () => {
      mockConceptosPorPeriodo({});
      mockFuentesCopiables([]);

      await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(fuentesIngresosModel.find).toHaveBeenCalledWith({
        sub,
        activo: { $ne: false },
        aguinaldo: { $ne: true },
      });
    });

    it('copia del mes anterior solo los conceptos de fuentes copiables', async () => {
      mockConceptosPorPeriodo({
        '2026-05': [
          { id_fuente_ingreso: idSueldo, periodo: '2026-05', valor: 1000 },
          { id_fuente_ingreso: idAguinaldo, periodo: '2026-05', valor: 500 },
        ],
      });
      mockFuentesCopiables([idSueldo]);

      const copiados = await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-05',
      });
      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2026-06',
      });
      expect(copiados).toEqual([
        {
          sub,
          id_fuente_ingreso: idSueldo,
          periodo: '2026-06',
          valor: 1000,
        },
      ]);
    });

    it('omite las fuentes que ya tienen un concepto en el período destino', async () => {
      mockConceptosPorPeriodo({
        '2026-05': [
          { id_fuente_ingreso: idSueldo, valor: 1000 },
          { id_fuente_ingreso: idFreelance, valor: 300 },
        ],
        '2026-06': [
          { id_fuente_ingreso: new Types.ObjectId(idFreelance.toString()) },
        ],
      });
      mockFuentesCopiables([idSueldo, idFreelance]);

      await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-06',
      });

      expect(conceptosIngresosModel.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ id_fuente_ingreso: idSueldo }),
      ]);
    });

    it('en enero copia desde diciembre del año anterior', async () => {
      mockConceptosPorPeriodo({});
      mockFuentesCopiables([]);

      await service.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: '2026-01',
      });

      expect(conceptosIngresosModel.find).toHaveBeenCalledWith({
        sub,
        periodo: '2025-12',
      });
    });

    it('si el mes anterior no tiene conceptos no inserta ninguno', async () => {
      mockConceptosPorPeriodo({});
      mockFuentesCopiables([idSueldo]);

      await expect(
        service.copiarDelPeriodoAnterior({ sub, periodoDestino: '2026-06' }),
      ).resolves.toEqual([]);
      expect(conceptosIngresosModel.insertMany).toHaveBeenCalledWith([]);
    });
  });
});
