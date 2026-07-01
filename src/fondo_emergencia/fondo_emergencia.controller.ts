// src\fondo_emergencia\fondo_emergencia.controller.ts

import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  Query,
} from '@nestjs/common';
import { FondoEmergenciaService } from './fondo_emergencia.service';
import { QuerySubDto } from '../utils/query.dto';
import { UpdateFondoEmergenciaDto } from './dto/update-fondo_emergencia.dto';

@ApiTags('Fondo de Emergencia')
@Controller('fondo-emergencia')
export class FondoEmergenciaController {
  constructor(
    private readonly fondoEmergenciaService: FondoEmergenciaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener el fondo de emergencia por usuario',
    description: 'Devuelve el fondo de emergencia asociado a un usuario (sub)',
  })
  @ApiQuery({
    name: 'sub',
    description: 'Identificador único del usuario (Auth0 sub)',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Fondo de emergencia encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findBySub(@Query() { sub }: QuerySubDto) {
    try {
      const data = await this.fondoEmergenciaService.findBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener el fondo de emergencia',
      );
    }
  }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar o crear el fondo de emergencia del usuario',
    description:
      'Actualiza parcialmente los datos del fondo de emergencia. Si no existe un registro para el sub indicado, lo crea automáticamente con los campos enviados y los valores por defecto para el resto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fondo de emergencia actualizado o creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos enviados',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(@Body() updateFondoEmergenciaDto: UpdateFondoEmergenciaDto) {
    try {
      const data = await this.fondoEmergenciaService.update({
        updateFondoEmergenciaDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar el fondo de emergencia',
      );
    }
  }
}
