import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Destination } from './ride-booking';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Rides {
  private API_URL = `${environment.RIDE_URL}`;

  constructor(private http: HttpClient) {}

  createNewRide(passengerId: number, driverId: number, start: Destination, dest: Destination): Observable<any>{
    const body = {driverId, passengerId, pickupLat: start.lat, pickupLng: start.lng, 
      dropoffLat: dest.lat, dropoffLng: dest.lng };

    return this.http.post<any>(`${this.API_URL}/ride`, body);
  }

  getRidesByDriverId(driverId: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.API_URL}/ride/driver/${driverId}`);
  }

  getRideByRideId(rideId: number): Observable<any>{
    return this.http.get<any>(`${this.API_URL}/ride/${rideId}`);
  }

  getRidesByPassengerid(passengerId: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.API_URL}/ride/passenger/${passengerId}`);
  }
  
  markRideAsComplete(rideId: number): Observable<any>{
    return this.http.put(`${this.API_URL}/ride/${rideId}/complete`, null);
  }
}
