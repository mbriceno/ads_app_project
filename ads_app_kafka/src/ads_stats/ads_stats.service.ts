import { Injectable, Inject, OnModuleInit} from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdStats } from './entities/ad-stats.entity';
import { AdsStatsGateway } from './ads_stats.gateway';


@Injectable()
export class AdsStatsService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @InjectRepository(AdStats) private statsRepo: Repository<AdStats>,
    private gateway: AdsStatsGateway,
  ) {}

  onModuleInit() {
    this.generateFakeTraffic();
  }

  // 1. Simular tráfico (Ingesta)
  async generateFakeTraffic() {
    const adIds = ['ad_101', 'ad_102', 'ad_103'];
    const events = ['impression', 'impression', 'impression', 'click']; // Más impresiones que clicks

    setInterval(() => {
      const randomAd = adIds[Math.floor(Math.random() * adIds.length)];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      // Enviamos a Kafka
      this.kafkaClient.emit('ad-events', { adId: randomAd, type: randomEvent });
      console.log(`Emitido: ${randomEvent} para ${randomAd}`);
    }, 1000); // 1 evento por segundo
  }

  // This logic was moved to a python script that call Apache Spark
  // @EventPattern('ad-events')
  // async handleAdEvent(@Payload() payload: any) {
  //   const { adId, type } = payload;

  //   let stat = await this.statsRepo.findOneBy({ adId });
  //   if (!stat) stat = this.statsRepo.create({ adId });

  //   if (type === 'impression') stat.impressions++;
  //   if (type === 'click') stat.clicks++;

  //   // Calcular CTR (Clicks / Impresiones)
  //   stat.ctr = stat.impressions > 0 ? (stat.clicks / stat.impressions) * 100 : 0;

  //   await this.statsRepo.save(stat);

  //   // 3. Notificar al Frontend (Real-time)
  //   this.gateway.sendStatsUpdate(await this.statsRepo.find());
  // }
}
