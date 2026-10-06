// src\fuentes_ingresos\fuentes_ingresos.service.ts

import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { FuentesIngresos } from './schema/fuentes_ingresos.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';

@Injectable()
export class FuentesIngresosService {
  constructor(
    @InjectModel(FuentesIngresos.name)
    readonly fuentesIngresosModel: Model<FuentesIngresos>,
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
  ) {}

  async findAllBySub({ sub }: { sub: string }): Promise<FuentesIngresos[]> {
    return this.fuentesIngresosModel.find({ sub }).exec();
  }

  async create({
    sub,
    createFuentesIngresoDto,
  }: {
    sub: string;
    createFuentesIngresoDto: CreateFuentesIngresosDto;
  }): Promise<FuentesIngresos> {
    const newFuenteIngreso = new this.fuentesIngresosModel({
      ...createFuentesIngresoDto,
      sub,
    });
    return newFuenteIngreso.save();
  }

  async updateById({
    sub,
    id,
    updateFuentesIngresosDto,
  }: {
    sub: string;
    id: Types.ObjectId;
    updateFuentesIngresosDto: UpdateFuentesIngresosDto;
  }): Promise<FuentesIngresos> {
    const fuente = await this.fuentesIngresosModel
      .findOneAndUpdate({ _id: id, sub }, updateFuentesIngresosDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!fuente) {
      throw new NotFoundException('No se encontró la fuente de ingreso');
    }

    return fuente;
  }

  async deleteById({
    sub,
    id,
  }: {
    sub: string;
    id: Types.ObjectId;
  }): Promise<FuentesIngresos | null> {
    const fuenteExiste = await this.fuentesIngresosModel
      .exists({ _id: id, sub })
      .exec();

    if (!fuenteExiste) {
      throw new NotFoundException('No se encontró la fuente de ingreso');
    }

    const conceptosAsociados = await this.conceptosIngresosModel
      .countDocuments({ id_fuente_ingreso: id, sub })
      .exec();

    if (conceptosAsociados > 0) {
      throw new ConflictException(
        'No se puede eliminar la fuente de ingreso porque tiene conceptos asociados',
      );
    }

    return this.fuentesIngresosModel.findOneAndDelete({ _id: id, sub }).exec();
  }
}
