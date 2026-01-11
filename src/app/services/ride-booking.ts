import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface Destination {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideBooking {
  private API_URL = `${environment.BOOKING_URL}`;
  private USERS_URL = `${environment.USERS_URL}/users`;

  private destinationSubject = new BehaviorSubject<Destination | null>(null);
  destination$ = this.destinationSubject.asObservable();

  constructor(private http: HttpClient, private auth: Auth) {}

  setDestination(dest: Destination) {
    this.destinationSubject.next(dest);
  }

  getDestination(): Destination | null {
    return this.destinationSubject.value;
  }

  //shit still doesn't fucking work
  createBooking(passengerId: number, driverId: number, start: Destination, dest: Destination): Observable<any> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<any>(`${this.API_URL}/requests?passengerId=${passengerId}&driverId=${driverId}&pickupLat=${start.lat}&pickupLng=${start.lng}&dropoffLat=${dest.lat}&dropoffLng=${dest.lng}`,
    { headers });
  }

  //neither does this one
  getBookingsByDriverId(driverId: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.API_URL}/requests/driver/${driverId}`);
  }

  getBookingsByPassengerId(passengerId: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.API_URL}/requests/passenger/${passengerId}`);
  }

  getBookingById(bookingId: number): Observable<any>{
    return this.http.get<any>(`${this.API_URL}/requests/${bookingId}`);
  }

  updateBookingStatus(bookingId: number, accepted: boolean){
    const status = accepted ? 'ACCEPTED' : 'DECLINED';
    this.http.patch(`${this.API_URL}/requests/${bookingId}/status?status=${status}`, null);
  }

  getDrivers(): Observable<any[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.USERS_URL}?role=driver`, { headers });
  }
}
