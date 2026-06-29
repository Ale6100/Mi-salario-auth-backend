// src\conceptos_ingresos\dto\update-conceptos_ingresos.dto.ts

import { CreateConceptosIngresosDto } from './create-conceptos_ingresos.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateConceptosIngresosDto extends PartialType(
  CreateConceptosIngresosDto,
) {}
