// src\conceptos_ingresos\conceptos_ingresos.service.ts

import { ConceptosIngresos } from './schema/conceptos_ingresos.schema';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuerySubPeriodoDto } from '../utils/query.dto';
import { UpdateConceptosIngresosDto } from './dto/update-conceptos_ingresos.dto';

@Injectable()
export class ConceptosIngresosService {
  constructor(
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
  ) {}

  async findAllBySub({
    sub,
    periodo,
  }: QuerySubPeriodoDto): Promise<ConceptosIngresos[]> {
    const filter: Record<string, string | undefined> = { sub };

    if (periodo) {
      filter.periodo = periodo;
    }

    return this.conceptosIngresosModel
      .find(filter)
      .populate('id_fuente_ingreso')
      .exec();
  }

  async createBySource({
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
