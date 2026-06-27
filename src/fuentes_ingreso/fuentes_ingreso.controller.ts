// src\fuentes_ingreso\fuentes_ingreso.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';
import { QuerySubDto } from './dto/query.dto';
import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { FuentesIngresosService } from './fuentes_ingreso.service';

@Controller('fuentes-ingresos')
export class FuentesIngresosController {
  constructor(
    private readonly fuentesIngresosService: FuentesIngresosService,
  ) {}

  @Get()
  async findAllBySub(@Query() { sub }: QuerySubDto) {
    try {
      const data = await this.fuentesIngresosService.findAllBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener las fuentes de ingreso',
      );
    }
  }

  @Post()
  async createBySub(
    @Query() query: QuerySubDto,
    @Body() createFuentesIngresoDto: CreateFuentesIngresosDto,
  ) {
    try {
      const data = await this.fuentesIngresosService.createBySub({
        sub: query.sub,
        createFuentesIngresoDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al crear la fuente de ingreso',
      );
    }
  }

  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() updateFuentesIngresosDto: UpdateFuentesIngresosDto,
  ) {
    try {
      const data = await this.fuentesIngresosService.updateById({
        id,
        updateFuentesIngresosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar la fuente de ingreso',
      );
    }
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    try {
      const data = await this.fuentesIngresosService.deleteById({ id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al eliminar la fuente de ingreso',
      );
    }
  }
}
