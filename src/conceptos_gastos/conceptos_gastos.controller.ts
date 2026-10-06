// src\conceptos_gastos\conceptos_gastos.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
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
import { QueryPeriodoDto } from '../utils/query.dto';
import { ConceptosGastosService } from './conceptos_gastos.service';
import { CreateConceptosGastosDto } from './dto/create-conceptos_gastos.dto';
import { UpdateConceptosGastosDto } from './dto/update-conceptos_gastos.dto';
import { PatchPagadoConceptosGastosDto } from './dto/patch-pagado-conceptos_gastos.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserSub } from '../utils/user-sub.decorator';
import { toHttpException } from '../utils/http-error';
import { CopiarPeriodoDto } from '../utils/copiar-periodo.dto';

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
      'Devuelve todos los conceptos de gasto asociados al usuario autenticado',
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
  async findAllBySub(
    @UserSub() sub: string,
    @Query() { periodo }: QueryPeriodoDto,
  ) {
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
      throw toHttpException(
        error,
        'Ocurrió un error al obtener los conceptos de gasto',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un concepto de gasto',
    description: 'Crea un nuevo concepto de gasto para el usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Concepto de gasto creado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createBySource(
    @UserSub() sub: string,
    @Body() createConceptosGastosDto: CreateConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.createBySource({
        sub,
        createConceptosGastosDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al crear el concepto de gasto',
      );
    }
  }

  @Post('copiar-periodo-anterior')
  @ApiOperation({
    summary: 'Copiar los gastos del mes anterior',
    description:
      'Copia al período destino los gastos del mes anterior. Se omiten las fuentes que ya tienen un concepto en el período destino. Los gastos copiados quedan como no pagados',
  })
  @ApiResponse({
    status: 201,
    description: 'Conceptos copiados (puede ser una lista vacía)',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async copiarDelPeriodoAnterior(
    @UserSub() sub: string,
    @Body() { periodo_destino }: CopiarPeriodoDto,
  ) {
    try {
      const data = await this.conceptosGastosService.copiarDelPeriodoAnterior({
        sub,
        periodoDestino: periodo_destino,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al copiar los gastos del mes anterior',
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
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateConceptosGastosDto: UpdateConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.updateById({
        sub,
        id,
        updateConceptosGastosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al actualizar el concepto de gasto',
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Marcar un concepto de gasto como pagado',
    description:
      'Marca un concepto de gasto como pagado, actualizando opcionalmente el monto final y aclaración',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de gasto a marcar como pagado',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Concepto de gasto marcado como pagado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async patchPagadoById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() patchPagadoConceptosGastosDto: PatchPagadoConceptosGastosDto,
  ) {
    try {
      const data = await this.conceptosGastosService.patchPagadoById({
        sub,
        id,
        patchPagadoConceptosGastosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al marcar el concepto de gasto como pagado',
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
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    try {
      const data = await this.conceptosGastosService.deleteById({ sub, id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al eliminar el concepto de gasto',
      );
    }
  }
}
