import { Controller, Get } from '@nestjs/common';
import { AdsStatsService } from './ads_stats.service';

@Controller('ads-stats')
export class AdsStatsController {

  constructor(private readonly adsStatsService: AdsStatsService) {}

  @Get()
  getAllStats() {
    // Aquí podrías añadir un método en tu servicio para devolver las estadísticas
    // return this.adsStatsService.findAll();
  }

}
