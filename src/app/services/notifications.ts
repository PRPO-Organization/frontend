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

  private eventSource?: EventSource;
  private reconnectTimer?: any;
  private readonly RECONNECT_DELAY = 3000;
  private isManuallyClosed = false;

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

  /*
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
  */

  startSse() {
    if (this.eventSource) 
      return;

    this.isManuallyClosed = false;

    const token = this.auth.getToken();
    if (!token) 
      return;

    console.log("Starting SSE connection...");

    this.eventSource = new EventSource(
      `${environment.NOTIFS_URL}/notifications/stream?token=${token}`
    );

    this.eventSource.addEventListener("notification", (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.addNotification(data);
      } catch (e) {
        console.error("Failed to parse SSE event", e);
      }
    });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.addNotification(data);
      } catch (e) {
        console.error("Failed to parse SSE message", e);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      this.cleanupSse();

      if (!this.isManuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  private cleanupSse() {
    if (this.eventSource) {
      console.log("Closing SSE connection");
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) 
      return;

    console.log("Scheduling SSE reconnect...");

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.startSse();
    }, this.RECONNECT_DELAY);
  }

  stopSse() {
    this.isManuallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.cleanupSse();
  }


}
