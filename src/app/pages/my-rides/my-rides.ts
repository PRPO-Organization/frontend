import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { RideBooking } from '../../services/ride-booking';
import { DatePipe } from '@angular/common';
import { Rides } from '../../services/rides';
import { Router } from '@angular/router';

export interface Ride {
  id: number;
  passengerId: number;
  driverId?: number;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  status: 'NEW' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

@Component({
  selector: 'app-my-rides',
  imports: [DatePipe],
  templateUrl: './my-rides.html',
  styleUrl: './my-rides.scss'
})
export class MyRides implements OnInit {
  role: string = 'CUSTOMER';
  id!: number;

  passengerRides: any[] = [];
  driverRides: any[] = [];

  previousPassengerRides: any[] = [];
  previousDriverRides: any[] = [];

  loadingRides = true;

  constructor(private auth: Auth, private booking: RideBooking, private cdr: ChangeDetectorRef, 
    private rides: Rides, private router: Router) {}

  ngOnInit(): void {
    this.auth.verifySelf().subscribe(user => {
      this.role = user.role;
      this.id = user.id;
      this.loadRides();
    });
  }

  loadRides(){
    this.booking.getBookingsByPassengerId(this.id).subscribe({
      next: (response) => {
        console.log(response);
        this.passengerRides = this.sortByDateDesc(response);
      },
      error: (err) => console.error(err)
    });

    this.rides.getRidesByPassengerid(this.id).subscribe({
      next: (response) => {
        console.log(response);
        this.previousPassengerRides = this.sortByDateAndCompleted(response);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });

    if(this.role === 'DRIVER'){
      this.booking.getBookingsByDriverId(this.id).subscribe({
        next: (response) => {
          console.log(response);
          this.driverRides = this.sortDriverRides(response);
          this.loadingRides = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loadingRides = false;
        }
      });

      this.rides.getRidesByDriverId(this.id).subscribe({
        next: (response) => {
          console.log(response);
          this.previousDriverRides = this.sortByDateAndCompleted(response);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }else
      this.loadingRides = false;
      this.cdr.detectChanges();
  }

  sortByDateDesc(rides: any[]) {
    return rides.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  sortByDateAndCompleted(rides: any[]) {
    return rides.filter(ride => ride.status === 'COMPLETED').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  sortDriverRides(rides: any[]){
    const statusPriority = { NEW: 0, ACCEPTED: 1, DECLINED: 1};

    return rides.sort((a, b) => {
      const aStat = a.status === 'NEW' ? 0 : 1;
      const bStat = b.status === 'NEW' ? 0 : 1;
      const statusDiff = aStat - bStat;

      if(statusDiff !== 0)
        return statusDiff;

      return(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
  }

  acceptRide(rideId: number){
    this.booking.updateBookingStatus(rideId, true);
  }

  declineRide(rideId: number){
    this.booking.updateBookingStatus(rideId, false);
  }

  rateDriver(driverId: number, rideId: number) {
    this.router.navigate(['/rate-driver'], {
      queryParams: {
        driverId,
        rideId
      }
    });
  }


}
