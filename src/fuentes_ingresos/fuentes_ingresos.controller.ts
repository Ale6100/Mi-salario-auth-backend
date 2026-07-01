// src\fuentes_ingresos\fuentes_ingreso.controller.ts

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  HttpException,
} from '@nestjs/common';
import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { FuentesIngresosService } from './fuentes_ingresos.service';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';

@ApiTags('Fuentes de Ingreso')
@Controller('fuentes-ingresos')
export class FuentesIngresosController {
  constructor(
    private readonly fuentesIngresosService: FuentesIngresosService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las fuentes de ingreso por usuario',
    description:
      'Devuelve todas las fuentes de ingreso asociadas a un usuario (sub)',
  })
  @ApiQuery({
    name: 'sub',
    description: 'Identificador único del usuario (Auth0 sub)',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de fuentes de ingreso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
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
  @ApiOperation({
    summary: 'Crear una fuente de ingreso',
    description:
      'Crea una nueva fuente de ingreso para el usuario especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Fuente de ingreso creada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() createFuentesIngresoDto: CreateFuentesIngresosDto) {
    try {
      const data = await this.fuentesIngresosService.create({
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
  @ApiOperation({
    summary: 'Actualizar una fuente de ingreso',
    description:
      'Actualiza los datos de una fuente de ingreso existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la fuente de ingreso',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fuente de ingreso actualizada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
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
  @ApiOperation({
    summary: 'Eliminar una fuente de ingreso',
    description: 'Elimina una fuente de ingreso existente por su ID ',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la fuente de ingreso',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fuente de ingreso eliminada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: la fuente de ingreso tiene conceptos asociados',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(@Param('id') id: string) {
    try {
      const data = await this.fuentesIngresosService.deleteById({ id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al eliminar la fuente de ingreso',
      );
    }
  }
}
