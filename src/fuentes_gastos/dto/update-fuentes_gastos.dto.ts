// src\fuentes_gastos\dto\update-fuentes_gastos.dto.ts

import { CreateFuentesGastosDto } from './create-fuentes_gastos.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateFuentesGastosDto extends PartialType(
  CreateFuentesGastosDto,
) {}
