import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Notifications } from '../../services/notifications';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = '';
  notifications: Object[] = [];

  constructor(private auth: Auth, private notifs: Notifications, private router: Router) {}
  
  loggedIn$: any;

  ngOnInit(): void {
    this.loggedIn$ = this.auth.loggedIn$;

    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response);
        this.firstName = response.firstName;
        this.lastName = response.lastName;
        this.role = response.role;
        this.email = response.email;

        //this.getNotifications();
      }
    });
  }

  toBooking(){
    this.router.navigate(['/map']);
  }

  toProfile(){
    this.router.navigate(['/profile']);
  }

  toMyRides(){
    this.router.navigate(['/my-rides']);
  }
}
