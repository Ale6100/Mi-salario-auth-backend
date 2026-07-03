import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { QuerySubDto } from '../utils/query.dto';

@ApiExcludeController()
@Controller('cron')
@UseGuards(ApiKeyGuard)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('info-actual') // Endpoint especial que hice para uso personal
  async getInfoActual(@Query() { sub }: QuerySubDto) {
    try {
      const data = await this.cronService.getInfoActual(sub);

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al obtener la información actual',
      );
    }
  }
}
