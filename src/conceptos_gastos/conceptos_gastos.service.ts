// src\conceptos_gastos\conceptos_gastos.service.ts

import { ConceptosGastos } from './schema/conceptos_gastos.schema';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatchPagadoConceptosGastosDto } from './dto/patch-pagado-conceptos_gastos.dto';
import { QuerySubPeriodoDto } from '../utils/query.dto';
import { UpdateConceptosGastosDto } from './dto/update-conceptos_gastos.dto';

@Injectable()
export class ConceptosGastosService {
  constructor(
    @InjectModel(ConceptosGastos.name)
    readonly conceptosGastosModel: Model<ConceptosGastos>,
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
  ) {}

  async findAllBySub({
    sub,
    periodo,
  }: QuerySubPeriodoDto): Promise<ConceptosGastos[]> {
    const filter: Record<string, string | undefined> = { sub };

    if (periodo) {
      filter.periodo = periodo;
    }

    const conceptos = await this.conceptosGastosModel
      .find(filter)
      .populate('id_fuente_gasto')
      .exec();

    const periodos = [...new Set(conceptos.map((c) => c.periodo))];

    const ingresosDelPeriodo = await this.conceptosIngresosModel
      .find({ sub, periodo: { $in: periodos } })
      .exec();

    const totalIngresosPorPeriodo: Record<string, number> = {};
    for (const ingreso of ingresosDelPeriodo) {
      totalIngresosPorPeriodo[ingreso.periodo] =
        (totalIngresosPorPeriodo[ingreso.periodo] ?? 0) + ingreso.valor;
    }

    return conceptos.map((c) => {
      const cObj = c.toObject();

      let monto = cObj.monto;
      if (monto === undefined || monto === -1) {
        if (
          cObj.porcentaje_total !== undefined &&
          cObj.porcentaje_total !== -1
        ) {
          const totalIngresos = totalIngresosPorPeriodo[cObj.periodo] ?? 0;
          monto = (cObj.porcentaje_total / 100) * totalIngresos;
        } else {
          monto = 0;
        }
      }

      return { ...cObj, monto };
    });
  }

  async createBySource({
    createConceptosGastosDto,
  }: {
    createConceptosGastosDto: CreateConceptosGastosDto;
  }) {
    const newConceptoGasto = new this.conceptosGastosModel(
      createConceptosGastosDto,
    );
    return newConceptoGasto.save();
  }

  async updateById({
    id,
    updateConceptosGastosDto,
  }: {
    id: string;
    updateConceptosGastosDto: UpdateConceptosGastosDto;
  }): Promise<ConceptosGastos | null> {
    return this.conceptosGastosModel
      .findByIdAndUpdate(id, updateConceptosGastosDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  async patchPagadoById({
    id,
    patchPagadoConceptosGastosDto,
  }: {
    id: string;
    patchPagadoConceptosGastosDto: PatchPagadoConceptosGastosDto;
  }): Promise<ConceptosGastos | null> {
    return this.conceptosGastosModel
      .findByIdAndUpdate(
        id,
        { ...patchPagadoConceptosGastosDto, pagado: true },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async deleteById({ id }: { id: string }): Promise<ConceptosGastos | null> {
    return this.conceptosGastosModel.findByIdAndDelete(id).exec();
  }
}
