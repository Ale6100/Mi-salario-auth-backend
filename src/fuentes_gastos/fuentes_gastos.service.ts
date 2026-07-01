// src\fuentes_gastos\fuentes_gastos.service.ts

import { ConceptosGastos } from '../conceptos_gastos/schema/conceptos_gastos.schema';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateFuentesGastosDto } from './dto/create-fuentes_gastos.dto';
import { FuentesGastos } from './schema/fuentes_gastos.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFuentesGastosDto } from './dto/update-fuentes_gastos.dto';

@Injectable()
export class FuentesGastosService {
  constructor(
    @InjectModel(FuentesGastos.name)
    readonly fuentesGastosModel: Model<FuentesGastos>,
    @InjectModel(ConceptosGastos.name)
    readonly conceptosGastosModel: Model<ConceptosGastos>,
  ) {}

  async findAllBySub({ sub }: QuerySubDto): Promise<FuentesGastos[]> {
    return this.fuentesGastosModel.find({ sub }).exec();
  }

  async create({
    createFuentesGastosDto,
  }: {
    createFuentesGastosDto: CreateFuentesGastosDto;
  }): Promise<FuentesGastos> {
    const newFuenteGasto = new this.fuentesGastosModel(createFuentesGastosDto);
    return newFuenteGasto.save();
  }

  async updateById({
    id,
    updateFuentesGastosDto,
  }: {
    id: string;
    updateFuentesGastosDto: UpdateFuentesGastosDto;
  }): Promise<FuentesGastos | null> {
    return this.fuentesGastosModel
      .findByIdAndUpdate(id, updateFuentesGastosDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  async deleteById({ id }: { id: string }): Promise<FuentesGastos | null> {
    const conceptosAsociados = await this.conceptosGastosModel
      .countDocuments({ id_fuente_gasto: id })
      .exec();

    if (conceptosAsociados > 0) {
      throw new ConflictException(
        'No se puede eliminar la fuente de gasto porque tiene conceptos asociados',
      );
    }

    return this.fuentesGastosModel.findByIdAndDelete(id).exec();
  }
}
