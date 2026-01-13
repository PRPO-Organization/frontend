import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Rides } from '../../services/rides';
import { interval, Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { Ratings } from '../../services/ratings';

@Component({
  selector: 'app-active-ride-passenger',
  imports: [CommonModule, DatePipe],
  templateUrl: './active-ride-passenger.html',
  styleUrl: './active-ride-passenger.scss'
})
export class ActiveRidePassenger implements OnInit, OnDestroy{

  refreshSub: Subscription | null = null;
  loading: boolean = false;
  driverRating: number = 0;
  
  allRides: any[] = [];
  ride: any = null;

  userId: number | null = null;
  driver: any = null;

  constructor(private auth: Auth, private rides: Rides, private cdr: ChangeDetectorRef, private rating: Ratings) {}

  ngOnInit(): void {
    this.auth.verifySelf().subscribe({
      next: (response) => {
        this.userId = response.id;
        this.loadActiveRide();

        this.refreshSub = interval(10000).subscribe(() => {
          this.loadActiveRide();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadActiveRide(){

    this.rides.getRidesByPassengerid(this.userId!).subscribe({
      next: (response) => {
        this.allRides = this.getActiveRides(response);
        console.log(this.allRides);

        this.ride = this.allRides[0];
        this.loading = false;
        this.cdr.detectChanges();

        this.getDriverInfo();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getActiveRides(rides: any[]): any[] {
    return rides
      .filter(ride => ride.status === 'NEW')
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  getDriverInfo(){
    this.auth.getUserInfo(this.ride.driverId).subscribe({
      next: (response) => {
        this.driver = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  submitRating(){
    this.rating.rateUser(this.userId!, this.driver.id, this.driverRating, '').subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (err) => console.error(err)
    });
  }

}
