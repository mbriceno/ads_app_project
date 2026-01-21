import { Inject, Body, Post} from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { AdsStatsService } from './ads_stats.service';
import { ClientKafka } from '@nestjs/microservices';

@Controller('ads-stats')
export class AdsStatsController {

  constructor(
    private readonly adsStatsService: AdsStatsService, 
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  @Get()
  getAllStats() {
    // Aquí podrías añadir un método en tu servicio para devolver las estadísticas
    // return this.adsStatsService.findAll();
  }

  @Post()
  async receiveEvent(@Body() body: { adId: string, type: string }) {
    this.kafkaClient.emit('ad-events', body);
    return { status: 'queued' };
  }

}
