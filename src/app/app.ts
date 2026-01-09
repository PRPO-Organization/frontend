import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { Auth } from './services/auth';
import { Notifications } from './services/notifications';
import { LocationTracking } from './services/location-tracking';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('prpo-frontend');

  constructor(private auth: Auth, private notifs: Notifications, private tracking: LocationTracking) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    if(token){
      this.notifs.startSse();
      this.notifs.getUnreadAccountNotifications();
      this.startIdChain();
    }
  }

  startIdChain(){
    let userId = null; 
    let userRole = null;
    this.auth.verifySelf().subscribe({
      next: (response) => {
        userId = response.id;
        userRole = response.role;
        this.tracking.startTracking(userId, userRole);
      }
    })
  }
}
