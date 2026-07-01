// src\conceptos_gastos\conceptos_gastos.service.ts

import { ConceptosGastos } from './schema/conceptos_gastos.schema';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatchMontoRealConceptosGastosDto } from './dto/patch-monto_real-conceptos_gastos..dto';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateConceptosGastosDto } from './dto/update-conceptos_gastos.dto';

type ConceptosGastosConColumna = ConceptosGastos & { columnaMonto: number };

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
  }: QuerySubDto): Promise<ConceptosGastosConColumna[]> {
    const conceptos = await this.conceptosGastosModel
      .find({ sub })
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
      const montoEst = cObj.monto_estimado;
      const porcentaje = cObj.porcentaje_total;

      let columnaMonto: number;

      if (montoEst !== undefined && montoEst !== -1) {
        columnaMonto = montoEst;
      } else if (porcentaje === undefined || porcentaje === -1) {
        columnaMonto = 0;
      } else {
        const totalIngresos = totalIngresosPorPeriodo[cObj.periodo] ?? 0;
        columnaMonto = (porcentaje / 100) * totalIngresos;
      }

      return { ...cObj, columnaMonto };
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

  async patchMontoRealById({
    id,
    patchMontoRealConceptosGastosDto,
  }: {
    id: string;
    patchMontoRealConceptosGastosDto: PatchMontoRealConceptosGastosDto;
  }): Promise<ConceptosGastos | null> {
    return this.conceptosGastosModel
      .findByIdAndUpdate(id, patchMontoRealConceptosGastosDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  async deleteById({ id }: { id: string }): Promise<ConceptosGastos | null> {
    return this.conceptosGastosModel.findByIdAndDelete(id).exec();
  }
}
