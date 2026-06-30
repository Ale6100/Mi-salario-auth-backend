// src\fuentes_gastos\fuentes_gastos.service.ts

import { CreateFuentesGastosDto } from './dto/create-fuentes_gastos.dto';
import { FuentesGastos } from './schema/fuentes_gastos.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFuentesGastosDto } from './dto/update-fuentes_gastos.dto';

@Injectable()
export class FuentesGastosService {
  constructor(
    @InjectModel(FuentesGastos.name)
    readonly fuentesGastosModel: Model<FuentesGastos>,
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
    // Todo: próximamente también se deberá verificar si existen conceptos asociados a la fuente de gasto antes de eliminarla, similar a cómo se hace en FuentesIngresosService.
    return this.fuentesGastosModel.findByIdAndDelete(id).exec();
  }
}
