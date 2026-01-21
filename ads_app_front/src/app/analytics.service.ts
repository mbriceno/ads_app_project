import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = 'http://localhost:3000/ads-stats';

  constructor(private http: HttpClient) {}

  trackEvent(adId: string, type: 'click' | 'impression') {
    // TODO: Change to navigator.sendBeacon to avoid blocking
    return this.http.post(this.apiUrl, { adId, type }).subscribe();
  }
}