import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Destination, RideBooking } from '../../services/ride-booking';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss'
})
export class Booking {
  destination: Destination | null = null;
  submitting: boolean = false;

  private userId: number = -1;
  drivers: any[] = [];
  selectedDriver: any = null;
  loadingDrivers: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private booking: RideBooking,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['lat'] && params['lng']) {
        this.destination = {
          lat: +params['lat'],
          lng: +params['lng']
        };
      }
    });

    this.loadingDrivers = true;
    this.booking.getDrivers().subscribe({
      next: (response) => {
        this.drivers = response;
        console.log(this.drivers);
        this.loadingDrivers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingDrivers = false;
        this.cdr.detectChanges();
      }
    })
  }

  confirmBooking() {
    if (!this.destination) 
      return;

    this.submitting = true;

    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response);
        this.userId  = response.id;
      }
    });

    //ADD DRIVE REQUEST THING HERE
  }

  selectDriver(driver: any) {
    this.selectedDriver = driver;
  }
}
