import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

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

  constructor(private http: HttpClient) {}

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
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  setLoggedIn() {
    this.loggedIn.next(true);
  }
}
