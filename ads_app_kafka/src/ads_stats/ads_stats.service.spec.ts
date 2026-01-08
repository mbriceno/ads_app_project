import { Test, TestingModule } from '@nestjs/testing';
import { AdsStatsService } from './ads_stats.service';

describe('AdsStatsService', () => {
  let service: AdsStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdsStatsService],
    }).compile();

    service = module.get<AdsStatsService>(AdsStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
