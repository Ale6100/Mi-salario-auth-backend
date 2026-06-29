// src\conceptos_ingresos\conceptos_ingresos.service.ts

import { ConceptosIngresos } from './schema/conceptos_ingresos.schema';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateConceptosIngresosDto } from './dto/update-conceptos_ingresos.dto';

@Injectable()
export class ConceptosIngresosService {
  constructor(
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
  ) {}

  async findAllBySub({ sub }: QuerySubDto): Promise<ConceptosIngresos[]> {
    return this.conceptosIngresosModel
      .find({ sub })
      .populate('id_fuente_ingreso')
      .exec();
  }

  async createBySourceSub({
    createConceptosIngresosDto,
  }: {
    createConceptosIngresosDto: CreateConceptosIngresosDto;
  }) {
    const newConceptoIngreso = new this.conceptosIngresosModel(
      createConceptosIngresosDto,
    );
    return newConceptoIngreso.save();
  }

  async updateById({
    id,
    updateConceptosIngresosDto,
  }: {
    id: string;
    updateConceptosIngresosDto: UpdateConceptosIngresosDto;
  }): Promise<ConceptosIngresos | null> {
    return this.conceptosIngresosModel
      .findByIdAndUpdate(id, updateConceptosIngresosDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  async deleteById({ id }: { id: string }): Promise<ConceptosIngresos | null> {
    return this.conceptosIngresosModel.findByIdAndDelete(id).exec();
  }
}
