import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification{
  id: number,
  recipient: string,
  subject: string,
  body: string,
  read: boolean,
  createdAt: Date
}

@Injectable({
  providedIn: 'root',
})
export class Notifications {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient, private auth: Auth) {}

  getUnreadAccountNotifications() {
    const headers = this.auth.getAuthHeaders();
    this.http.get<Notification[]>(`${environment.NOTIFS_URL}/notifications/me/unread`, { headers }).subscribe({
      next: (notifs) => {
        console.log(notifs)
        this.notificationsSubject.next(notifs);
      },
      error: (err) => {
        console.error("Error fetching account notifications:", err);
      }
    });
  }

  getAllNotifications(): Observable<Notification[]>{
    const headers = this.auth.getAuthHeaders();
    return this.http.get<Notification[]>(`${environment.NOTIFS_URL}/notifications/me`, { headers });
  }

  markAsRead() {
    const headers = this.auth.getAuthHeaders();
    console.log({ headers });
    this.http.put<any>(`${environment.NOTIFS_URL}/notifications/me`, null, { headers }).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.error("Error marking notifications as read", err);
      }
    })
  }

  clearNotifications(){
    this.notificationsSubject.next([]);
  }

  /*
  addNotification(n: Notification) {
    const updated = [n, ...this.notificationsSubject.value];
    this.notificationsSubject.next(updated);
    console.log(n);
  }
  */

  addNotification(n: Notification) {
    const current = Array.isArray(this.notificationsSubject.value) ? this.notificationsSubject.value : [];
    const updated = [n, ...current];
    this.notificationsSubject.next(updated);
    console.log(n);
  }

  startSse() {
    const token = this.auth.getToken();
    const eventSource = new EventSource(`${environment.NOTIFS_URL}/notifications/stream?token=${token}`);

    eventSource.addEventListener("notification", (event: any) => {
    console.log("SSE notification event:", event);
    try {
      console.log(event.data)
      const data = JSON.parse(event.data);
      this.addNotification(data);
    } catch (e) {
      console.error("Failed to parse SSE event", e);
    }
  });

    eventSource.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(event.data);
      this.addNotification(data);
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };
  }
}
