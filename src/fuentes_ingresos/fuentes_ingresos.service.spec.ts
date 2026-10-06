// src\fuentes_ingresos\fuentes_ingresos.service.spec.ts

import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import {
  createModelMock,
  ModelMock,
  queryResult,
} from '../test-utils/mongoose-model.mock';
import { FuentesIngresosService } from './fuentes_ingresos.service';
import { FuentesIngresos } from './schema/fuentes_ingresos.schema';

describe('FuentesIngresosService', () => {
  const sub = 'auth0|usuario-a';
  const id = new Types.ObjectId();

  let service: FuentesIngresosService;
  let fuentesIngresosModel: ModelMock;
  let conceptosIngresosModel: ModelMock;

  beforeEach(async () => {
    fuentesIngresosModel = createModelMock();
    conceptosIngresosModel = createModelMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        FuentesIngresosService,
        {
          provide: getModelToken(FuentesIngresos.name),
          useValue: fuentesIngresosModel,
        },
        {
          provide: getModelToken(ConceptosIngresos.name),
          useValue: conceptosIngresosModel,
        },
      ],
    }).compile();

    service = moduleRef.get(FuentesIngresosService);
  });

  it('lista solo las fuentes del usuario autenticado', async () => {
    const fuentes = [{ nombre: 'Sueldo' }];
    fuentesIngresosModel.find.mockReturnValue(queryResult(fuentes));

    await expect(service.findAllBySub({ sub })).resolves.toBe(fuentes);
    expect(fuentesIngresosModel.find).toHaveBeenCalledWith({ sub });
  });

  it('al crear asigna el sub recibido aunque el DTO traiga otro', async () => {
    const createFuentesIngresoDto = {
      nombre: 'Sueldo',
      color: '#FF0000',
      activo: true,
      sub: 'auth0|otro-usuario',
    };

    await service.create({ sub, createFuentesIngresoDto });

    expect(fuentesIngresosModel).toHaveBeenCalledWith({
      nombre: 'Sueldo',
      color: '#FF0000',
      activo: true,
      sub,
    });
  });

  describe('updateById', () => {
    it('filtra por id y sub y corre los validadores del schema', async () => {
      const actualizada = { nombre: 'Freelance' };
      fuentesIngresosModel.findOneAndUpdate.mockReturnValue(
        queryResult(actualizada),
      );
      const updateFuentesIngresosDto = { nombre: 'Freelance' };

      await expect(
        service.updateById({ sub, id, updateFuentesIngresosDto }),
      ).resolves.toBe(actualizada);
      expect(fuentesIngresosModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, sub },
        updateFuentesIngresosDto,
        { returnDocument: 'after', runValidators: true },
      );
    });

    it('lanza NotFoundException si la fuente no es del usuario', async () => {
      fuentesIngresosModel.findOneAndUpdate.mockReturnValue(queryResult(null));

      await expect(
        service.updateById({ sub, id, updateFuentesIngresosDto: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('lanza NotFoundException y no borra si la fuente no es del usuario', async () => {
      fuentesIngresosModel.exists.mockReturnValue(queryResult(null));

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        NotFoundException,
      );
      expect(fuentesIngresosModel.exists).toHaveBeenCalledWith({
        _id: id,
        sub,
      });
      expect(fuentesIngresosModel.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('lanza ConflictException y no borra si la fuente tiene conceptos del usuario', async () => {
      fuentesIngresosModel.exists.mockReturnValue(queryResult({ _id: id }));
      conceptosIngresosModel.countDocuments.mockReturnValue(queryResult(2));

      await expect(service.deleteById({ sub, id })).rejects.toThrow(
        ConflictException,
      );
      expect(conceptosIngresosModel.countDocuments).toHaveBeenCalledWith({
        id_fuente_ingreso: id,
        sub,
      });
      expect(fuentesIngresosModel.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('borra filtrando por id y sub cuando no hay conceptos asociados', async () => {
      const eliminada = { _id: id };
      fuentesIngresosModel.exists.mockReturnValue(queryResult({ _id: id }));
      conceptosIngresosModel.countDocuments.mockReturnValue(queryResult(0));
      fuentesIngresosModel.findOneAndDelete.mockReturnValue(
        queryResult(eliminada),
      );

      await expect(service.deleteById({ sub, id })).resolves.toBe(eliminada);
      expect(fuentesIngresosModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: id,
        sub,
      });
    });
  });
});
