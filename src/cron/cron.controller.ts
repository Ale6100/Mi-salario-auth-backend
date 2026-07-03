import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  getInfoActual(@Query() { sub }: QuerySubDto) {
    return this.cronService.getInfoActual(sub);
  }
}
