// src\fuentes_gastos\fuentes_gastos.service.ts

import { ConceptosGastos } from '../conceptos_gastos/schema/conceptos_gastos.schema';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFuentesGastosDto } from './dto/create-fuentes_gastos.dto';
import { FuentesGastos } from './schema/fuentes_gastos.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateFuentesGastosDto } from './dto/update-fuentes_gastos.dto';

@Injectable()
export class FuentesGastosService {
  constructor(
    @InjectModel(FuentesGastos.name)
    readonly fuentesGastosModel: Model<FuentesGastos>,
    @InjectModel(ConceptosGastos.name)
    readonly conceptosGastosModel: Model<ConceptosGastos>,
  ) {}

  async findAllBySub({ sub }: { sub: string }): Promise<FuentesGastos[]> {
    return this.fuentesGastosModel.find({ sub }).exec();
  }

  async create({
    sub,
    createFuentesGastosDto,
  }: {
    sub: string;
    createFuentesGastosDto: CreateFuentesGastosDto;
  }): Promise<FuentesGastos> {
    const newFuenteGasto = new this.fuentesGastosModel({
      ...createFuentesGastosDto,
      sub,
    });
    return newFuenteGasto.save();
  }

  async updateById({
    sub,
    id,
    updateFuentesGastosDto,
  }: {
    sub: string;
    id: Types.ObjectId;
    updateFuentesGastosDto: UpdateFuentesGastosDto;
  }): Promise<FuentesGastos> {
    const fuente = await this.fuentesGastosModel
      .findOneAndUpdate({ _id: id, sub }, updateFuentesGastosDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!fuente) {
      throw new NotFoundException('No se encontró la fuente de gasto');
    }

    return fuente;
  }

  async deleteById({
    sub,
    id,
  }: {
    sub: string;
    id: Types.ObjectId;
  }): Promise<FuentesGastos | null> {
    const fuenteExiste = await this.fuentesGastosModel
      .exists({ _id: id, sub })
      .exec();

    if (!fuenteExiste) {
      throw new NotFoundException('No se encontró la fuente de gasto');
    }

    const conceptosAsociados = await this.conceptosGastosModel
      .countDocuments({ id_fuente_gasto: id, sub })
      .exec();

    if (conceptosAsociados > 0) {
      throw new ConflictException(
        'No se puede eliminar la fuente de gasto porque tiene conceptos asociados',
      );
    }

    return this.fuentesGastosModel.findOneAndDelete({ _id: id, sub }).exec();
  }
}
