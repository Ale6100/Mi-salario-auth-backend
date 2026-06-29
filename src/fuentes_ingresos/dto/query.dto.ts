// src\fuentes_ingreso\dto\query.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QuerySubDto {
  @ApiProperty({
    description: 'Identificador único del usuario (Auth0 sub)',
    example: 'auth0|123456789',
  })
  @IsString()
  readonly sub!: string;
}
