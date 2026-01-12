import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import { Subscription } from 'rxjs';
import { Rides } from '../../services/rides';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-active-ride-driver',
  imports: [CommonModule],
  templateUrl: './active-ride-driver.html',
  styleUrl: './active-ride-driver.scss'
})
export class ActiveRideDriver implements OnInit, OnDestroy{
  ride: any = null;
  allRides: any[] = [];
  loading: boolean = false;
  completing: boolean = false;

  userId: number | null = null;
  userRole: string = 'CUSTOMER';

  passengerInfo: any = null;

  distanceKm: number | null = null;
  private map: any;
  private driverMarker: any;
  private destinationMarker: any;
  private startMarker: any;
  private geoSub?: Subscription;

  private readonly autocompleteThreshold = 0.1  //100m or closer to autocomplete

  constructor(private http: HttpClient, private geolocation$: WaGeolocationService, private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object, private rides: Rides, private auth: Auth) {}

  ngOnInit(): void {
    this.auth.verifySelf().subscribe({
      next: (response) => {
        this.userId = response.id;
        this.userRole = response.role;
        if(this.userRole !== 'DRIVER')
          return;

        this.loadActiveRide();
      }
    });
  }

  ngOnDestroy(): void {
    this.geoSub?.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }

  private loadActiveRide(){
    this.rides.getRidesByDriverId(this.userId!).subscribe({
      next: (response) => {
        this.allRides = this.getActiveRides(response);
        console.log(this.allRides);

        this.ride = this.allRides[0];
        this.loading = false;
        this.cdr.detectChanges();

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initMap(), 0);
        }

        this.getPassengerInfo();
        this.startLiveTracking();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private getPassengerInfo(){
    this.auth.getUserInfo(3).subscribe({
      next: (response) => {
        this.passengerInfo = response;
        console.log(response);

      },
      error: (err) => console.error(err)
    });
  }

  completeRide(){
    this.completing = true;
    this.rides.markRideAsComplete(this.ride.id).subscribe({
      next: (response) => {
        console.log(response);
        this.completing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.completing = false;
        this.cdr.detectChanges();
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

  private startLiveTracking() {
    this.geoSub = this.geolocation$.subscribe(position => {
      if (!position || !this.map) return;

      const { latitude, longitude } = position.coords;

      if (!this.driverMarker) {
        import('leaflet').then(L => {
          const Leaflet = L.default || L;
          this.driverMarker = Leaflet.marker([latitude, longitude])
            .addTo(this.map)
            .bindPopup('You');
        });
      } else {
        this.driverMarker.setLatLng([latitude, longitude]);
      }

      this.updateDistance(latitude, longitude);
    });
  }

  private updateDistance(lat: number, lng: number) {
    const d = this.haversineDistance(
      lat,
      lng,
      this.ride.dropoffLat,
      this.ride.dropoffLng
    );

    this.distanceKm = d;
    this.cdr.detectChanges();

    if (d <= this.autocompleteThreshold && !this.completing) {
      this.rides.markRideAsComplete(this.ride.id);
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }


  // map
  private async initMap() {
    const L = await import('leaflet');
    const Leaflet = L.default || L;

    delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
    Leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });

    this.map = Leaflet.map('driver-map').setView(
      [this.ride.pickupLat, this.ride.pickupLng],
      14
    );

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.startMarker = Leaflet.marker([
      this.ride.pickupLat,
      this.ride.pickupLng
    ])
      .addTo(this.map)
      .bindPopup('Pickup');

    this.destinationMarker = Leaflet.marker([
      this.ride.dropoffLat,
      this.ride.dropoffLng
    ])
      .addTo(this.map)
      .bindPopup('Destination');
  }
}
