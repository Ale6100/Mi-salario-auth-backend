// src\fuentes_ingresos\fuentes_ingresos.service.ts

import { ConceptosIngresos } from 'src/conceptos_ingresos/schema/conceptos_ingresos.schema';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { FuentesIngresos } from './schema/fuentes_ingresos.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';
import { QuerySubDto } from 'src/utils/query.dto';

@Injectable()
export class FuentesIngresosService {
  constructor(
    @InjectModel(FuentesIngresos.name)
    readonly fuentesIngresosModel: Model<FuentesIngresos>,
    @InjectModel(ConceptosIngresos.name)
    readonly conceptosIngresosModel: Model<ConceptosIngresos>,
  ) {}

  async findAllBySub({ sub }: QuerySubDto): Promise<FuentesIngresos[]> {
    return this.fuentesIngresosModel.find({ sub }).exec();
  }

  async createBySub({
    createFuentesIngresoDto,
  }: {
    createFuentesIngresoDto: CreateFuentesIngresosDto;
  }): Promise<FuentesIngresos> {
    const newFuenteIngreso = new this.fuentesIngresosModel(
      createFuentesIngresoDto,
    );
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
    const conceptosAsociados = await this.conceptosIngresosModel
      .countDocuments({ id_fuente_ingreso: id })
      .exec();

    if (conceptosAsociados > 0) {
      throw new ConflictException(
        'No se puede eliminar la fuente de ingreso porque tiene conceptos asociados',
      );
    }

    return this.fuentesIngresosModel.findByIdAndDelete(id).exec();
  }
}
