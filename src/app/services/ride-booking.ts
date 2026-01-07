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

  createBooking(userId: string, dest: Destination) {
    const headers = this.auth.getAuthHeaders();
    return this.http.post(`${this.API_URL}/ride-request`, {
      userId,
      destination: dest,
    }, { headers });
  }

  getDrivers(): Observable<any[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.USERS_URL}?role=driver`, { headers });
  }
}
