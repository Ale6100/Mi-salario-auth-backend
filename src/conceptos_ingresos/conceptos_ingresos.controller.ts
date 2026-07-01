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
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ConceptosIngresosService } from './conceptos_ingresos.service';
import { CreateConceptosIngresosDto } from './dto/create-conceptos_ingresos.dto';
import { QuerySubPeriodoDto } from '../utils/query.dto';
import { UpdateConceptosIngresosDto } from './dto/update-conceptos_ingresos.dto';

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
      'Devuelve todos los conceptos de ingreso asociados a un usuario (sub)',
  })
  @ApiQuery({
    name: 'sub',
    description: 'Identificador único del usuario (Auth0 sub)',
    required: true,
    type: String,
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
  async findAllBySub(@Query() { sub, periodo }: QuerySubPeriodoDto) {
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
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener los conceptos de ingreso',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un concepto de ingreso',
    description:
      'Crea un nuevo concepto de ingreso para el usuario especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Concepto de ingreso creado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createBySource(
    @Body() createConceptosIngresosDto: CreateConceptosIngresosDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.createBySource({
        createConceptosIngresosDto,
      });

      return {
        statusCode: 201,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al crear el concepto de ingreso',
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
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateById(
    @Param('id') id: string,
    @Body() updateConceptosIngresosDto: UpdateConceptosIngresosDto,
  ) {
    try {
      const data = await this.conceptosIngresosService.updateById({
        id,
        updateConceptosIngresosDto,
      });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar el concepto de ingreso',
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
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async deleteById(@Param('id') id: string) {
    try {
      const data = await this.conceptosIngresosService.deleteById({ id });

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al eliminar el concepto de ingreso',
      );
    }
  }
}
