// src\conceptos_ingresos\conceptos_ingresos.service.ts

import { ConceptosIngresos } from './schema/conceptos_ingresos.schema';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { FuentesIngresos } from '../fuentes_ingresos/schema/fuentes_ingresos.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryPeriodoDto } from '../utils/query.dto';
import { getPeriodoAnterior } from '../utils/periodo';
import { UpdateConceptosIngresosDto } from './dto/update-conceptos_ingresos.dto';

@Injectable()
export class ConceptosIngresosService {
  constructor(
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
    @InjectModel(FuentesIngresos.name)
    readonly fuentesIngresosModel: Model<FuentesIngresos>,
  ) {}

  async findAllBySub({
    sub,
    periodo,
  }: QueryPeriodoDto & { sub: string }): Promise<ConceptosIngresos[]> {
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
    sub,
    createConceptosIngresosDto,
  }: {
    sub: string;
    createConceptosIngresosDto: CreateConceptosIngresosDto;
  }) {
    await this.assertFuenteIngresoDelUsuario({
      sub,
      idFuenteIngreso: createConceptosIngresosDto.id_fuente_ingreso,
    });

    const newConceptoIngreso = new this.conceptosIngresosModel({
      ...createConceptosIngresosDto,
      sub,
    });
    return newConceptoIngreso.save();
  }

  async updateById({
    sub,
    id,
    updateConceptosIngresosDto,
  }: {
    sub: string;
    id: Types.ObjectId;
    updateConceptosIngresosDto: UpdateConceptosIngresosDto;
  }): Promise<ConceptosIngresos> {
    if (updateConceptosIngresosDto.id_fuente_ingreso) {
      await this.assertFuenteIngresoDelUsuario({
        sub,
        idFuenteIngreso: updateConceptosIngresosDto.id_fuente_ingreso,
      });
    }

    const concepto = await this.conceptosIngresosModel
      .findOneAndUpdate({ _id: id, sub }, updateConceptosIngresosDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!concepto) {
      throw new NotFoundException('No se encontró el concepto de ingreso');
    }

    return concepto;
  }

  async deleteById({
    sub,
    id,
  }: {
    sub: string;
    id: Types.ObjectId;
  }): Promise<ConceptosIngresos> {
    const concepto = await this.conceptosIngresosModel
      .findOneAndDelete({ _id: id, sub })
      .exec();

    if (!concepto) {
      throw new NotFoundException('No se encontró el concepto de ingreso');
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
    const [conceptosOrigen, conceptosDestino, fuentesCopiables] =
      await Promise.all([
        this.conceptosIngresosModel
          .find({ sub, periodo: getPeriodoAnterior(periodoDestino) })
          .exec(),
        this.conceptosIngresosModel
          .find({ sub, periodo: periodoDestino })
          .exec(),
        this.fuentesIngresosModel
          .find({ sub, activo: { $ne: false }, aguinaldo: { $ne: true } })
          .exec(),
      ]);

    const idsFuentesCopiables = new Set(
      fuentesCopiables.map((f) => f._id.toString()),
    );
    const fuentesConIngresoEnDestino = new Set(
      conceptosDestino.map((c) => c.id_fuente_ingreso.toString()),
    );

    const nuevosConceptos = conceptosOrigen
      .filter((c) => {
        const idFuente = c.id_fuente_ingreso.toString();
        return (
          idsFuentesCopiables.has(idFuente) &&
          !fuentesConIngresoEnDestino.has(idFuente)
        );
      })
      .map((c) => ({
        sub,
        id_fuente_ingreso: c.id_fuente_ingreso,
        periodo: periodoDestino,
        valor: c.valor,
      }));

    return this.conceptosIngresosModel.insertMany(nuevosConceptos);
  }

  private async assertFuenteIngresoDelUsuario({
    sub,
    idFuenteIngreso,
  }: {
    sub: string;
    idFuenteIngreso: string;
  }) {
    const fuente = await this.fuentesIngresosModel
      .exists({ _id: idFuenteIngreso, sub })
      .exec();

    if (!fuente) {
      throw new NotFoundException('No se encontró la fuente de ingreso');
    }
  }
}
