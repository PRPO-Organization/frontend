import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationTracking } from './location-tracking';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly TOKEN_KEY = 'authToken';
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn())

  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private tracking: LocationTracking) {}

  register(data: any) {
    return this.http.post(`${environment.USERS_URL}/users/register`, data);
  }

  login(data: any) {
    return this.http.post<{ token: string }>(`${environment.USERS_URL}/users/login`, data);
  }

  verifySelf(){
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${environment.USERS_URL}/users/me`, { headers });
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.loggedIn.next(false);
    this.tracking.stopTracking();
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  setLoggedIn() {
    this.loggedIn.next(true);
  }

  updateSelf(body: any): Observable<string>{
    const headers = this.getAuthHeaders();
    return this.http.put<string>(`${environment.USERS_URL}/users/me`, body, { headers });
  }

  getUserInfo(userId: number): Observable<any>{
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${environment.USERS_URL}/users/${userId}`, { headers });
  }
}
