// src\fuentes_ingreso\fuentes_ingreso.service.ts

import { FuentesIngreso } from './schema/fuentes_ingreso.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FuentesIngresoService {
  constructor(
    @InjectModel(FuentesIngreso.name)
    readonly fuentesIngresoModel: Model<FuentesIngreso>,
  ) {}

  async findAllBySub({ sub }: { sub: string }): Promise<FuentesIngreso[]> {
    return this.fuentesIngresoModel.find({ sub }).exec();
  }
}
