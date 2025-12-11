import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { Auth } from './services/auth';
import { Notifications } from './services/notifications';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('prpo-frontend');

  constructor(private auth: Auth, private notifs: Notifications) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    if(token){
      this.notifs.startSse();
      this.notifs.getUnreadAccountNotifications();
    }
  }
}
