import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class LocationTracking {
  private sub?: Subscription;
  private lastSent: number = 0;
  private readonly trackingUpdateTime = 5000;

  private API_URL = `${environment.LOCATIONS_URL}/api/location`;

  constructor(private geolocation$: WaGeolocationService, private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  startTracking(userId: number, userRole: string){
    if(!isPlatformBrowser(this.platformId))
      return;

    if(this.sub)
      return;

    let isDriver = false;
    if(userRole.toLocaleLowerCase() === "driver")
      isDriver = true;

    this.sub = this.geolocation$.subscribe(position => {
      if(!position)
        return;

      const { latitude, longitude, accuracy } = position.coords;

      //backend call every 5 seconds
      const now = Date.now();
      if(now - this.lastSent < this.trackingUpdateTime)
        return;

      this.lastSent = now;
      this.sendLocation(userId, latitude, longitude, isDriver);
    });
  }

  stopTracking(){
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  private sendLocation(userId: number, lat: number, lng: number, isDriver: boolean){
    const body = { lat, lng, isDriver };
    this.http.post(`${this.API_URL}/${userId}`, body);
  }

  getNearestDrivers(lat: number, lng: number, driverCount: number): Observable<any[]>{
    const body = {lat, lng, isDriver: true};
    return this.http.post<any[]>(`${this.API_URL}/nearest/${driverCount}`, body);
  }
}
