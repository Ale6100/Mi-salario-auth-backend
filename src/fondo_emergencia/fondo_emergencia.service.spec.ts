// src\fondo_emergencia\fondo_emergencia.service.spec.ts

import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { model } from 'mongoose';
import {
  createModelMock,
  ModelMock,
  queryResult,
} from '../test-utils/mongoose-model.mock';
import { UpdateFondoEmergenciaDto } from './dto/update-fondo_emergencia.dto';
import { FondoEmergenciaService } from './fondo_emergencia.service';
import {
  FondoEmergencia,
  FondoEmergenciaSchema,
} from './schema/fondo_emergencia.schema';

describe('FondoEmergenciaService', () => {
  const sub = 'auth0|usuario-a';

  let service: FondoEmergenciaService;
  let fondoEmergenciaModel: ModelMock;

  beforeEach(async () => {
    fondoEmergenciaModel = createModelMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        FondoEmergenciaService,
        {
          provide: getModelToken(FondoEmergencia.name),
          useValue: fondoEmergenciaModel,
        },
      ],
    }).compile();

    service = moduleRef.get(FondoEmergenciaService);
  });

  it('busca el fondo del usuario autenticado', async () => {
    const fondo = { sub, monto_pesos: 1000 };
    fondoEmergenciaModel.findOne.mockReturnValue(queryResult(fondo));

    await expect(service.findBySub({ sub })).resolves.toBe(fondo);
    expect(fondoEmergenciaModel.findOne).toHaveBeenCalledWith({ sub });
  });

  it('hace upsert por sub y solo actualiza los campos enviados, incluido saldo_real en null', async () => {
    fondoEmergenciaModel.findOneAndUpdate.mockReturnValue(queryResult({}));
    const updateFondoEmergenciaDto = Object.assign(
      new UpdateFondoEmergenciaDto(),
      { monto_pesos: 500, monto_dolares: undefined, saldo_real: null },
    );

    await service.update({ sub, updateFondoEmergenciaDto });

    expect(fondoEmergenciaModel.findOneAndUpdate).toHaveBeenCalledWith(
      { sub },
      { $set: { monto_pesos: 500, saldo_real: null } },
      expect.objectContaining({ upsert: true, returnDocument: 'after' }),
    );
  });

  it('no envía incluir_dolares si no viene en el DTO, para que al crear el fondo aplique el default del schema', async () => {
    fondoEmergenciaModel.findOneAndUpdate.mockReturnValue(queryResult({}));
    const updateFondoEmergenciaDto = Object.assign(
      new UpdateFondoEmergenciaDto(),
      { monto_pesos: 500 },
    );

    await service.update({ sub, updateFondoEmergenciaDto });

    expect(fondoEmergenciaModel.findOneAndUpdate).toHaveBeenCalledWith(
      { sub },
      { $set: { monto_pesos: 500 } },
      expect.objectContaining({ upsert: true }),
    );
  });

  it('el schema no incluye los dólares en el fondo por defecto', () => {
    const FondoEmergenciaModel = model(
      FondoEmergencia.name,
      FondoEmergenciaSchema,
    );

    expect(new FondoEmergenciaModel({ sub }).incluir_dolares).toBe(false);
  });
});
