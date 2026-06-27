// src\fuentes_ingreso\dto\create-fuentes_ingresos.dto.ts

import { IsBoolean, IsString } from 'class-validator';

export class CreateFuentesIngresosDto {
  @IsString()
  readonly nombre!: string;

  @IsBoolean()
  readonly activo!: boolean;

  @IsBoolean()
  readonly aguinaldo!: boolean;

  @IsString()
  readonly color!: string;
}
