// src\fuentes_gastos\fuentes_gastos.controller.ts

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
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateFuentesGastosDto } from './dto/create-fuentes_gastos.dto';
import { FuentesGastosService } from './fuentes_gastos.service';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFuentesGastosDto } from './dto/update-fuentes_gastos.dto';

@ApiTags('Conceptos de Gastos')
@Controller('fuentes-gastos')
export class FuentesGastosController {
  constructor(private readonly fuentesGastosService: FuentesGastosService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las fuentes de gastos por usuario',
    description:
      'Devuelve todas las fuentes de gastos asociadas a un usuario (sub)',
  })
  @ApiQuery({
    name: 'sub',
    description: 'Identificador único del usuario (Auth0 sub)',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de fuentes de gastos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAllBySub(@Query() { sub }: QuerySubDto) {
    try {
      const data = await this.fuentesGastosService.findAllBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener las fuentes de gastos',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una fuente de gastos',
    description: 'Crea una nueva fuente de gastos para el usuario especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Fuente de gastos creada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() createFuentesGastosDto: CreateFuentesGastosDto) {
    try {
      const data = await this.fuentesGastosService.create({
        createFuentesGastosDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al crear la fuente de gastos',
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una fuente de gastos',
    description:
      'Actualiza los datos de una fuente de gastos existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la fuente de gastos',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fuente de gastos actualizada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @Param('id') id: string,
    @Body() updateFuentesGastosDto: UpdateFuentesGastosDto,
  ) {
    try {
      const data = await this.fuentesGastosService.updateById({
        id,
        updateFuentesGastosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar la fuente de gastos',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una fuente de gastos',
    description: 'Elimina una fuente de gastos existente por su ID ',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la fuente de gastos',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fuente de gastos eliminada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(@Param('id') id: string) {
    try {
      const data = await this.fuentesGastosService.deleteById({ id });

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
          : 'Ocurrió un error al eliminar la fuente de gastos',
      );
    }
  }
}
