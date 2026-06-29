// src\fuentes_ingreso\fuentes_ingresos.service.ts

import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';
import { FuentesIngresos } from './schema/fuentes_ingreso.schema';

@Injectable()
export class FuentesIngresosService {
  constructor(
    @InjectModel(FuentesIngresos.name)
    readonly fuentesIngresosModel: Model<FuentesIngresos>,
  ) {}

  async findAllBySub({ sub }: { sub: string }): Promise<FuentesIngresos[]> {
    return this.fuentesIngresosModel.find({ sub }).exec();
  }

  async createBySub({
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
    id,
    updateFuentesIngresosDto,
  }: {
    id: string;
    updateFuentesIngresosDto: UpdateFuentesIngresosDto;
  }): Promise<FuentesIngresos | null> {
    return this.fuentesIngresosModel
      .findByIdAndUpdate(id, updateFuentesIngresosDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  async deleteById({ id }: { id: string }): Promise<FuentesIngresos | null> {
    return this.fuentesIngresosModel.findByIdAndDelete(id).exec();
  }
}
