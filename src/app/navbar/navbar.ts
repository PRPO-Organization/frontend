import { Component, OnInit } from '@angular/core';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { Notifications } from '../services/notifications';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnInit {

  loggedIn$: any;
  email: string = '';
  notifications: any[] = [];
  notifications$: Observable<any[]>;

  constructor(private auth: Auth, private router: Router, private notifs: Notifications) {
    this.notifications$ = this.notifs.notifications$;
  }

  ngOnInit(): void {
    this.loggedIn$ = this.auth.loggedIn$;

    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response);
        this.email = response.email;

        this.getNotifications();
      }
    });
  }

  getNotifications(){
    this.notifs.getAccountNotifications();

    this.notifs.notifications$.subscribe(nList => {
      this.notifications = nList;
    })
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'])
  }

  toRegister(){
    this.router.navigate(['/register']);
  }
}
