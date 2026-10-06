// src\fuentes_gastos\fuentes_gastos.service.spec.ts

import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ConceptosGastos } from '../conceptos_gastos/schema/conceptos_gastos.schema';
import {
  createModelMock,
  ModelMock,
  queryResult,
} from '../test-utils/mongoose-model.mock';
import { FuentesGastosService } from './fuentes_gastos.service';
import { FuentesGastos } from './schema/fuentes_gastos.schema';

describe('FuentesGastosService', () => {
  const sub = 'auth0|usuario-a';
  const id = new Types.ObjectId();

  let service: FuentesGastosService;
  let fuentesGastosModel: ModelMock;
  let conceptosGastosModel: ModelMock;

  beforeEach(async () => {
    fuentesGastosModel = createModelMock();
    conceptosGastosModel = createModelMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        FuentesGastosService,
        {
          provide: getModelToken(FuentesGastos.name),
          useValue: fuentesGastosModel,
        },
        {
          provide: getModelToken(ConceptosGastos.name),
          useValue: conceptosGastosModel,
        },
      ],
    }).compile();

    service = moduleRef.get(FuentesGastosService);
  });

  it('lista solo las fuentes del usuario autenticado', async () => {
    const fuentes = [{ nombre: 'Alquiler' }];
    fuentesGastosModel.find.mockReturnValue(queryResult(fuentes));

    await expect(service.findAllBySub({ sub })).resolves.toBe(fuentes);
    expect(fuentesGastosModel.find).toHaveBeenCalledWith({ sub });
  });

  it('al crear asigna el sub recibido aunque el DTO traiga otro', async () => {
    const createFuentesGastosDto = {
      nombre: 'Alquiler',
      color: '#FF0000',
      sub: 'auth0|otro-usuario',
    };

    await service.create({ sub, createFuentesGastosDto });

    expect(fuentesGastosModel).toHaveBeenCalledWith({
      nombre: 'Alquiler',
      color: '#FF0000',
      sub,
    });
  });

  describe('updateById', () => {
    it('filtra por id y sub y corre los validadores del schema', async () => {
      const actualizada = { nombre: 'Luz' };
      fuentesGastosModel.findOneAndUpdate.mockReturnValue(
        queryResult(actualizada),
      );
      const updateFuentesGastosDto = { nombre: 'Luz' };

      await expect(
        service.updateById({ sub, id, updateFuentesGastosDto }),
      ).resolves.toBe(actualizada);
      expect(fuentesGastosModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, sub },
        updateFuentesGastosDto,
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('lanza NotFoundException si la fuente no es del usuario', async () => {
      fuentesGastosModel.findOneAndUpdate.mockReturnValue(queryResult(null));

      await expect(
        service.updateById({ sub, id, updateFuentesGastosDto: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('lanza NotFoundException y no borra si la fuente no es del usuario', async () => {
      fuentesGastosModel.exists.mockReturnValue(queryResult(null));

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        NotFoundException,
      );
      expect(fuentesGastosModel.exists).toHaveBeenCalledWith({ _id: id, sub });
      expect(fuentesGastosModel.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('lanza ConflictException y no borra si la fuente tiene conceptos del usuario', async () => {
      fuentesGastosModel.exists.mockReturnValue(queryResult({ _id: id }));
      conceptosGastosModel.countDocuments.mockReturnValue(queryResult(2));

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        ConflictException,
      );
      expect(conceptosGastosModel.countDocuments).toHaveBeenCalledWith({
        id_fuente_gasto: id,
        sub,
      });
      expect(fuentesGastosModel.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('borra filtrando por id y sub cuando no hay conceptos asociados', async () => {
      const eliminada = { _id: id };
      fuentesGastosModel.exists.mockReturnValue(queryResult({ _id: id }));
      conceptosGastosModel.countDocuments.mockReturnValue(queryResult(0));
      fuentesGastosModel.findOneAndDelete.mockReturnValue(
        queryResult(eliminada),
      );

      await expect(service.deleteById({ sub, id })).resolves.toBe(eliminada);
      expect(fuentesGastosModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: id,
        sub,
      });
    });
  });
});
