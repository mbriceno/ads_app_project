import { Module } from '@nestjs/common';
import { AdsStatsService } from './ads_stats.service';
import { AdsStatsController } from './ads_stats.controller';
import { AdsStatsGateway } from './ads_stats.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdStats } from './entities/ad-stats.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    TypeOrmModule.forFeature([AdStats]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: { brokers: [configService.get<string>('KAFKA_BROKER', 'localhost:19092')] },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AdsStatsController],
  providers: [AdsStatsService, AdsStatsGateway],
  exports: [AdsStatsService],
})
export class AdStatsModule {}
