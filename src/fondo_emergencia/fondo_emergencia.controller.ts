// src\fondo_emergencia\fondo_emergencia.controller.ts

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { FondoEmergenciaService } from './fondo_emergencia.service';
import { UpdateFondoEmergenciaDto } from './dto/update-fondo_emergencia.dto';
import { UserSub } from '../utils/user-sub.decorator';
import { toHttpException } from '../utils/http-error';

@ApiTags('Fondo de Emergencia')
@Controller('fondo-emergencia')
export class FondoEmergenciaController {
  constructor(
    private readonly fondoEmergenciaService: FondoEmergenciaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener el fondo de emergencia por usuario',
    description:
      'Devuelve el fondo de emergencia asociado al usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Fondo de emergencia encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findBySub(@UserSub() sub: string) {
    try {
      const data = await this.fondoEmergenciaService.findBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al obtener el fondo de emergencia',
      );
    }
  }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar o crear el fondo de emergencia del usuario',
    description:
      'Actualiza parcialmente los datos del fondo de emergencia. Si el usuario no tiene un registro, lo crea automáticamente con los campos enviados y los valores por defecto para el resto.',
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
  async update(
    @UserSub() sub: string,
    @Body() updateFondoEmergenciaDto: UpdateFondoEmergenciaDto,
  ) {
    try {
      const data = await this.fondoEmergenciaService.update({
        sub,
        updateFondoEmergenciaDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al actualizar el fondo de emergencia',
      );
    }
  }
}
