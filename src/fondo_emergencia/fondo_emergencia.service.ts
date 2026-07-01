// src\fondo_emergencia\fondo_emergencia.service.ts

import { FondoEmergencia } from './schema/fondo_emergencia.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFondoEmergenciaDto } from './dto/update-fondo_emergencia.dto';

@Injectable()
export class FondoEmergenciaService {
  constructor(
    @InjectModel(FondoEmergencia.name)
    readonly fondoEmergenciaModel: Model<FondoEmergencia>,
  ) {}

  async findBySub({ sub }: QuerySubDto): Promise<FondoEmergencia | null> {
    return this.fondoEmergenciaModel.findOne({ sub }).exec();
  }

  async update({
    updateFondoEmergenciaDto,
  }: {
    updateFondoEmergenciaDto: UpdateFondoEmergenciaDto;
  }): Promise<FondoEmergencia | null> {
    const { sub, ...updateData } = updateFondoEmergenciaDto;

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined),
    );

    return this.fondoEmergenciaModel
      .findOneAndUpdate(
        { sub },
        { $set: cleanData },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
  }
}
