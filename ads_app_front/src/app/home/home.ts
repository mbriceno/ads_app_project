import { Component } from '@angular/core';
import { AnalyticsService } from '../analytics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(private analyticsService: AnalyticsService) {}

  clickAds(adId: string) {
    this.analyticsService.trackEvent(adId, 'click');
    console.log('Click enviado para:', adId);
  }
}
