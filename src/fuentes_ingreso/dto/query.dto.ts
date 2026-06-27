// src\fuentes_ingreso\dto\query.dto.ts

import { IsString } from 'class-validator';

export class QuerySubDto {
  @IsString()
  readonly sub!: string;
}
