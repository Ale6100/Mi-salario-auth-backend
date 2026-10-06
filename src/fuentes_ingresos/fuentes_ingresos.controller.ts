// src\fuentes_ingresos\fuentes_ingreso.controller.ts

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateFuentesIngresosDto } from './dto/create-fuentes_ingresos.dto';
import { FuentesIngresosService } from './fuentes_ingresos.service';
import { UpdateFuentesIngresosDto } from './dto/update-fuentes_ingresos.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserSub } from '../utils/user-sub.decorator';
import { toHttpException } from '../utils/http-error';

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
      'Devuelve todas las fuentes de ingreso asociadas al usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Lista de fuentes de ingreso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAllBySub(@UserSub() sub: string) {
    try {
      const data = await this.fuentesIngresosService.findAllBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al obtener las fuentes de ingreso',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una fuente de ingreso',
    description: 'Crea una nueva fuente de ingreso para el usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Fuente de ingreso creada exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(
    @UserSub() sub: string,
    @Body() createFuentesIngresoDto: CreateFuentesIngresosDto,
  ) {
    try {
      const data = await this.fuentesIngresosService.create({
        sub,
        createFuentesIngresoDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al crear la fuente de ingreso',
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
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateFuentesIngresosDto: UpdateFuentesIngresosDto,
  ) {
    try {
      const data = await this.fuentesIngresosService.updateById({
        sub,
        id,
        updateFuentesIngresosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al actualizar la fuente de ingreso',
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
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    try {
      const data = await this.fuentesIngresosService.deleteById({ sub, id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al eliminar la fuente de ingreso',
      );
    }
  }
}
