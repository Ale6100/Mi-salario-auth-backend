// src\fuentes_ingreso\fuentes_ingreso.controller.ts

import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthSub } from '../utils/auth-sub.decorator';
import { FuentesIngresoService } from './fuentes_ingreso.service';

@Controller('fuentes-ingreso')
export class FuentesIngresoController {
  constructor(private readonly fuentesIngresoService: FuentesIngresoService) {}

  @Get()
  async findAllBySub(@AuthSub() sub: string | undefined) {
    if (!sub) {
      throw new BadRequestException(
        'No se pudo identificar al usuario desde el token',
      );
    }

    try {
      const data = await this.fuentesIngresoService.findAllBySub({ sub });

      return {
        statusCode: 200,
        data,
      };
    } catch {
      throw new InternalServerErrorException(
        'Ocurrió un error al obtener las fuentes de ingreso',
      );
    }
  }
}
