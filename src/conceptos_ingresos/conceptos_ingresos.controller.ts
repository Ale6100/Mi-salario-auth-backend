import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ConceptosIngresosService } from './conceptos_ingresos.service';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { QueryPeriodoDto } from '../utils/query.dto';
import { UpdateConceptosIngresosDto } from './dto/update-conceptos_ingresos.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserSub } from '../utils/user-sub.decorator';
import { toHttpException } from '../utils/http-error';
import { CopiarPeriodoDto } from '../utils/copiar-periodo.dto';

@ApiTags('Conceptos de Ingreso')
@Controller('conceptos-ingresos')
export class ConceptosIngresosController {
  constructor(
    private readonly conceptosIngresosService: ConceptosIngresosService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los conceptos de ingreso por usuario',
    description:
      'Devuelve todos los conceptos de ingreso asociados al usuario autenticado',
  })
  @ApiQuery({
    name: 'periodo',
    description:
      'Período en formato YYYY-MM para filtrar los conceptos (ej. 2026-06)',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de conceptos de ingreso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAllBySub(
    @UserSub() sub: string,
    @Query() { periodo }: QueryPeriodoDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.findAllBySub({
        sub,
        periodo,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al obtener los conceptos de ingreso',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un concepto de ingreso',
    description:
      'Crea un nuevo concepto de ingreso para el usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Concepto de ingreso creado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createBySource(
    @UserSub() sub: string,
    @Body() createConceptosIngresosDto: CreateConceptosIngresosDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.createBySource({
        sub,
        createConceptosIngresosDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al crear el concepto de ingreso',
      );
    }
  }

  @Post('copiar-periodo-anterior')
  @ApiOperation({
    summary: 'Copiar los ingresos del mes anterior',
    description:
      'Copia al período destino los ingresos del mes anterior. Se omiten las fuentes que ya tienen un concepto en el período destino y las fuentes de ingreso inactivas o de aguinaldo',
  })
  @ApiResponse({
    status: 201,
    description: 'Conceptos copiados (puede ser una lista vacía)',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async copiarDelPeriodoAnterior(
    @UserSub() sub: string,
    @Body() { periodo_destino }: CopiarPeriodoDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.copiarDelPeriodoAnterior(
        {
          sub,
          periodoDestino: periodo_destino,
        },
      );

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al copiar los ingresos del mes anterior',
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un concepto de ingreso',
    description:
      'Actualiza los datos de un concepto de ingreso existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de ingreso a actualizar',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Concepto de ingreso actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateConceptosIngresosDto: UpdateConceptosIngresosDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.updateById({
        sub,
        id,
        updateConceptosIngresosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al actualizar el concepto de ingreso',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un concepto de ingreso',
    description: 'Elimina un concepto de ingreso existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del concepto de ingreso',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Concepto de ingreso eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(
    @UserSub() sub: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    try {
      const data = await this.conceptosIngresosService.deleteById({ sub, id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw toHttpException(
        error,
        'Ocurrió un error al eliminar el concepto de ingreso',
      );
    }
  }
}
