import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Notifications } from '../../services/notifications';
import { Router } from '@angular/router';
import { LocationTracking } from '../../services/location-tracking';

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
  id: number | null = null;

  notifications: Object[] = [];

  manualLocationRequired: boolean = false;

  constructor(private auth: Auth, private notifs: Notifications, private router: Router, 
    private tracking: LocationTracking) {}
  
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
        this.id = response.id;

        this.checkGeolocation();

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

  checkGeolocation() {
    this.tracking.getUserLocation(this.id!).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.log("Assigning manual location in Ljubljana");
        this.tracking.sendLocation(this.id!, 46.0569, 14.5058, this.role === 'DRIVER' ? true : false)
          .subscribe({
            next: (response) => {
              console.log(response)
            }
          });
      }
    })

    if(!('geolocation' in navigator)){
      this.manualLocationRequired = true;
      return;
    }

    navigator.permissions.query({ name: 'geolocation' as PermissionName})
      .then(permission => {
        if(permission.state === 'denied'){
          this.manualLocationRequired = true;
          return;
        }
      });
  }
}
