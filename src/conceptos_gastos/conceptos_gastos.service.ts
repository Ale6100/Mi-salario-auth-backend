// src\conceptos_gastos\conceptos_gastos.service.ts

import { ConceptosGastos } from './schema/conceptos_gastos.schema';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { FuentesGastos } from '../fuentes_gastos/schema/fuentes_gastos.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PatchPagadoConceptosGastosDto } from './dto/patch-pagado-conceptos_gastos.dto';
import { QueryPeriodoDto } from '../utils/query.dto';
import { getPeriodoAnterior } from '../utils/periodo';
import { UpdateConceptosGastosDto } from './dto/update-conceptos_gastos.dto';

@Injectable()
export class ConceptosGastosService {
  constructor(
    @InjectModel(ConceptosGastos.name)
    readonly conceptosGastosModel: Model<ConceptosGastos>,
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
    @InjectModel(FuentesGastos.name)
    readonly fuentesGastosModel: Model<FuentesGastos>,
  ) {}

  async findAllBySub({
    sub,
    periodo,
  }: QueryPeriodoDto & { sub: string }): Promise<ConceptosGastos[]> {
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
    sub,
    createConceptosGastosDto,
  }: {
    sub: string;
    createConceptosGastosDto: CreateConceptosGastosDto;
  }) {
    await this.assertFuenteGastoDelUsuario({
      sub,
      idFuenteGasto: createConceptosGastosDto.id_fuente_gasto,
    });

    const newConceptoGasto = new this.conceptosGastosModel({
      ...createConceptosGastosDto,
      sub,
    });
    return newConceptoGasto.save();
  }

  async updateById({
    sub,
    id,
    updateConceptosGastosDto,
  }: {
    sub: string;
    id: Types.ObjectId;
    updateConceptosGastosDto: UpdateConceptosGastosDto;
  }): Promise<ConceptosGastos> {
    if (updateConceptosGastosDto.id_fuente_gasto) {
      await this.assertFuenteGastoDelUsuario({
        sub,
        idFuenteGasto: updateConceptosGastosDto.id_fuente_gasto,
      });
    }

    const concepto = await this.conceptosGastosModel
      .findOneAndUpdate({ _id: id, sub }, updateConceptosGastosDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!concepto) {
      throw new NotFoundException('No se encontró el concepto de gasto');
    }

    return concepto;
  }

  async patchPagadoById({
    sub,
    id,
    patchPagadoConceptosGastosDto,
  }: {
    sub: string;
    id: Types.ObjectId;
    patchPagadoConceptosGastosDto: PatchPagadoConceptosGastosDto;
  }): Promise<ConceptosGastos> {
    const concepto = await this.conceptosGastosModel
      .findOneAndUpdate(
        { _id: id, sub },
        { ...patchPagadoConceptosGastosDto, pagado: true },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    if (!concepto) {
      throw new NotFoundException('No se encontró el concepto de gasto');
    }

    return concepto;
  }

  async deleteById({
    sub,
    id,
  }: {
    sub: string;
    id: Types.ObjectId;
  }): Promise<ConceptosGastos> {
    const concepto = await this.conceptosGastosModel
      .findOneAndDelete({ _id: id, sub })
      .exec();

    if (!concepto) {
      throw new NotFoundException('No se encontró el concepto de gasto');
    }

    return concepto;
  }

  async copiarDelPeriodoAnterior({
    sub,
    periodoDestino,
  }: {
    sub: string;
    periodoDestino: string;
  }) {
    const [conceptosOrigen, conceptosDestino] = await Promise.all([
      this.conceptosGastosModel
        .find({ sub, periodo: getPeriodoAnterior(periodoDestino) })
        .exec(),
      this.conceptosGastosModel.find({ sub, periodo: periodoDestino }).exec(),
    ]);

    const fuentesConGastoEnDestino = new Set(
      conceptosDestino.map((c) => c.id_fuente_gasto.toString()),
    );

    const nuevosConceptos = conceptosOrigen
      .filter(
        (c) => !fuentesConGastoEnDestino.has(c.id_fuente_gasto.toString()),
      )
      .map((c) => {
        const usaPorcentaje =
          c.porcentaje_total !== undefined && c.porcentaje_total !== -1;

        return {
          sub,
          id_fuente_gasto: c.id_fuente_gasto,
          periodo: periodoDestino,
          monto: usaPorcentaje ? -1 : c.monto,
          porcentaje_total: c.porcentaje_total,
        };
      });

    return this.conceptosGastosModel.insertMany(nuevosConceptos);
  }

  private async assertFuenteGastoDelUsuario({
    sub,
    idFuenteGasto,
  }: {
    sub: string;
    idFuenteGasto: string;
  }) {
    const fuente = await this.fuentesGastosModel
      .exists({ _id: idFuenteGasto, sub })
      .exec();

    if (!fuente) {
      throw new NotFoundException('No se encontró la fuente de gasto');
    }
  }
}
