import { Test, TestingModule } from '@nestjs/testing';
import { AdsStatsController } from './ads_stats.controller';

describe('AdsStatsController', () => {
  let controller: AdsStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsStatsController],
    }).compile();

    controller = module.get<AdsStatsController>(AdsStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
