import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Destination, RideBooking } from '../../services/ride-booking';
import { Ratings } from '../../services/ratings';
import { LocationTracking } from '../../services/location-tracking';
import * as L from 'leaflet';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss'
})
export class Booking {
  start: Destination | null = null;
  showMapPicker = false;
  map: any;
  marker: any;

  destination: Destination | null = null;
  submitting: boolean = false;

  private userId: number = -1;
  drivers: any[] = [];
  locationList: any[] = [];
  selectedDriver: any = null;
  loadingDrivers: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private booking: RideBooking,
    private cdr: ChangeDetectorRef,
    private ratings: Ratings,
    private tracking: LocationTracking
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['lat'] && params['lng']) {
        this.destination = {
          lat: +params['lat'],
          lng: +params['lng']
        };
      }
    });

    if(!this.destination?.lat && !this.destination?.lng)
      return;

    //this.loadDrivers();
    this.getUserLocation();
  }

  loadDrivers(){
    this.loadingDrivers = true;
    this.booking.getDrivers().subscribe({
      next: async (response) => {
        this.drivers = response;
        console.log(this.drivers);
        await this.calculateRating();
        this.getNearestDrivers(this.destination?.lat!, this.destination?.lng!, 5);
        this.loadingDrivers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingDrivers = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmBooking() {
    if (!this.destination) 
      return;

    this.submitting = true;

    this.auth.verifySelf().subscribe({
      next: (response) => {
        this.userId  = response.id;
        this.confirmBooking2();
      }
    });

    //ADD DRIVE REQUEST THING HERE
  }

  private confirmBooking2(){
    console.log("booking log 1",this.selectedDriver);
    console.log("booking log 2",this.userId, this.selectedDriver.id, this.start!, this.destination!);
    this.booking.createBooking(this.userId, this.selectedDriver.id, this.start!, this.destination!).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => console.error(err)
    });
  }

  selectDriver(driver: any) {
    this.selectedDriver = driver;
  }

  async calculateRating(){
    this.drivers.forEach(d => {
      this.ratings.getDriverAverageRating(d.id).subscribe({
        next: (response) => {
          d.ratings = response;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    });
  }

  async getNearestDrivers(lat: number, lng: number, driverCount: number){
    this.tracking.getNearestDrivers(lat, lng, driverCount).subscribe({
      next: (response) =>{
        this.locationList = response;
        console.log("nearest driver ids:", response);
        this.matchDriverIdToUser();
      },
      error: (err) => console.error(err)
    });
  }

  matchDriverIdToUser(){
    const locationMap = new Map(
      this.locationList.map(l => [l.id, l])
    );

    const driversWithLocation = this.drivers.map(driver => {
      const location = locationMap.get(driver.id);

      return {
        ...driver,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null
      };
    });

    const driversWithDistance = driversWithLocation.map(d => ({
      ...d,
      distanceKm: this.getDistanceKm(d.lat, d.lng, this.start?.lat!, this.start?.lng!)
    }));

    this.drivers = driversWithDistance;
    this.cdr.detectChanges();
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  getDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km

    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  getUserLocation(){
    if(!navigator.geolocation){
      this.openMapPicker();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.start = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log("User location:", this.start.lat, this.start.lng);

        // Continue normal flow
        this.loadDrivers();
      },
      (error) => {
        console.warn("Geolocation failed:", error.message);
        this.openMapPicker();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000
      }
    );
  }




  // leaflet

  openMapPicker() {
    this.showMapPicker = true;

    setTimeout(() => {
      if (!this.map) {
        this.map = L.map('map').setView([41.9981, 21.4254], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.map.on('click', (e: any) => {
          this.start = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
          };

          if (this.marker) {
            this.marker.setLatLng(e.latlng);
          } else {
            this.marker = L.marker(e.latlng).addTo(this.map);
          }

          console.log("Selected pickup:", this.start?.lat, this.start?.lng);

          //this.showMapPicker = false;
          this.loadDrivers();
        });
      }
    }, 0);
  }

}
