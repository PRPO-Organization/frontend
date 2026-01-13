import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Ratings {
  private API_URL = `${environment.RATINGS_URL}/api/ratings`

  constructor(private auth: Auth, private http: HttpClient) {}

  getDriverAverageRating(driverId: number): Observable<any[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<any[]>(`${this.API_URL}/users/${driverId}/avg`, { headers });
  }

  rateUser(userId: number, ratedUserId: number, userRating: number, comment: string): Observable<any>{
    const headers = this.auth.getAuthHeaders();
    const body = { ratedUserId, userRating, comment };
    return this.http.post<any>(`${this.API_URL}/${userId}`, body, { headers, responseType: 'text' as 'json' });
  } 
}
