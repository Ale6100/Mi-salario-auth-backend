// src\fuentes_ingresos\dto\update-fuentes_ingresos.dto.ts

import { CreateFuentesIngresosDto } from './create-fuentes_ingresos.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateFuentesIngresosDto extends PartialType(
  CreateFuentesIngresosDto,
) {}
