// src\conceptos_gastos\dto\update-conceptos_gastos.dto.ts

import { CreateConceptosGastosDto } from './create-conceptos_gastos.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateConceptosGastosDto extends PartialType(
  CreateConceptosGastosDto,
) {}
