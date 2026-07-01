// src\conceptos_gastos\conceptos_gastos.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QuerySubPeriodoDto } from '../utils/query.dto';
import { ConceptosGastosService } from './conceptos_gastos.service';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { UpdateConceptosGastosDto } from './dto/update-conceptos_gastos.dto';
import { PatchMontoRealConceptosGastosDto } from './dto/patch-monto_real-conceptos_gastos..dto';

@ApiTags('Conceptos de Gasto')
@Controller('conceptos-gastos')
export class ConceptosGastosController {
  constructor(
    private readonly conceptosGastosService: ConceptosGastosService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los conceptos de gasto por usuario',
    description:
      'Devuelve todos los conceptos de gasto asociados a un usuario (sub)',
  })
  @ApiQuery({
    name: 'sub',
    description: 'Identificador único del usuario (Auth0 sub)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'periodo',
    description:
      'Período en formato YYYY-MM para filtrar los conceptos (ej. 2026-06)',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de conceptos de gasto' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAllBySub(@Query() { sub, periodo }: QuerySubPeriodoDto) {
    try {
      const data = await this.conceptosGastosService.findAllBySub({
        sub,
        periodo,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener los conceptos de gasto',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un concepto de gasto',
    description: 'Crea un nuevo concepto de gasto para el usuario especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Concepto de gasto creado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createBySource(
    @Body() createConceptosGastosDto: CreateConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.createBySource({
        createConceptosGastosDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al crear el concepto de gasto',
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un concepto de gasto',
    description:
      'Actualiza los datos de un concepto de gasto existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de gasto a actualizar',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Concepto de gasto actualizado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @Param('id') id: string,
    @Body() updateConceptosGastosDto: UpdateConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.updateById({
        id,
        updateConceptosGastosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar el concepto de gasto',
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar el monto real de un concepto de gasto',
    description:
      'Actualiza el monto real de un concepto de gasto existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de gasto a actualizar',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Monto real del concepto de gasto actualizado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async patchMontoRealById(
    @Param('id') id: string,
    @Body() patchMontoRealConceptosGastosDto: PatchMontoRealConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.patchMontoRealById({
        id,
        patchMontoRealConceptosGastosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar el monto real del concepto de gasto',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un concepto de gasto',
    description: 'Elimina un concepto de gasto existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de gasto',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Concepto de gasto eliminado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(@Param('id') id: string) {
    try {
      const data = await this.conceptosGastosService.deleteById({ id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al eliminar el concepto de gasto',
      );
    }
  }
}
