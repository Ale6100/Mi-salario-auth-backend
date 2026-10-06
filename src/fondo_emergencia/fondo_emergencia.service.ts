// src\fondo_emergencia\fondo_emergencia.service.ts

import { FondoEmergencia } from './schema/fondo_emergencia.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateFondoEmergenciaDto } from './dto/update-fondo_emergencia.dto';

@Injectable()
export class FondoEmergenciaService {
  constructor(
    @InjectModel(FondoEmergencia.name)
    readonly fondoEmergenciaModel: Model<FondoEmergencia>,
  ) {}

  async findBySub({ sub }: { sub: string }): Promise<FondoEmergencia | null> {
    return this.fondoEmergenciaModel.findOne({ sub }).exec();
  }

  async update({
    sub,
    updateFondoEmergenciaDto,
  }: {
    sub: string;
    updateFondoEmergenciaDto: UpdateFondoEmergenciaDto;
  }): Promise<FondoEmergencia | null> {
    const cleanData = Object.fromEntries(
      Object.entries(updateFondoEmergenciaDto).filter(
        ([, v]) => v !== undefined,
      ),
    );

    return this.fondoEmergenciaModel
      .findOneAndUpdate(
        { sub },
        { $set: cleanData },
        { returnDocument: 'after', upsert: true, runValidators: true },
      )
      .exec();
  }
}
