import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {WaGeolocationService} from '@ng-web-apis/geolocation';
import { take } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaflet-map.html',
  styleUrls: ['./leaflet-map.scss']
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  private map: any = null;
  private marker: any = null;
  private circle: any = null;
  private polygon: any = null;

  selectedDestination: { lat: number; lng: number } | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly geolocation$: WaGeolocationService, private router: Router
  ) {}

  async ngAfterViewInit() {
    // Only initialize map in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(async () => {
        await this.setupMap();
      }, 200);
    }
  }

  private async setupMap() {
    // Dynamic import - only loads in browser
    const L = await import('leaflet');
    const Leaflet = L.default || L;

    // Fix Leaflet default icon issue in Angular
    delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
    Leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Create the map
    this.map = Leaflet.map('map').setView([51.505, -0.09], 13);

    this.geolocation$.pipe(take(1)).subscribe((position) => {
      if (position) {
        const { latitude, longitude } = position.coords;
        this.map.setView([latitude, longitude], 15); // center map
        this.marker.setLatLng([latitude, longitude]);
        this.selectedDestination = { lat: latitude, lng: longitude }; // optional: start at current location
      }
    });


    /*
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      console.log('Clicked lat/lng:', e.latlng); // Latitude and longitude
      console.log('Clicked pixel:', this.map.latLngToContainerPoint(e.latlng)); // Pixel position relative to map container
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = Leaflet.marker(e.latlng).addTo(this.map);
    });
    */

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = Leaflet.marker(e.latlng).addTo(this.map);

      // Save selected destination
      this.selectedDestination = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      console.log('Destination set to:', this.selectedDestination);
    });


    // Add tile layer
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker
    this.marker = Leaflet.marker([51.5, -0.09]).addTo(this.map);
    this.marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
    this.geolocation$.pipe(take(1)).subscribe((position) => {
      if (position) {
        const { latitude, longitude } = position.coords;
        this.marker.setLatLng([latitude, longitude]);
      }
    });

    // Add circle
    // this.circle = Leaflet.circle([51.508, -0.11], {
    //   color: 'red',
    //   fillColor: '#f03',
    //   fillOpacity: 0.5,
    //   radius: 500
    // }).addTo(this.map);

    // // Add polygon
    // this.polygon = Leaflet.polygon([
    //   [51.509, -0.08],
    //   [51.503, -0.06],
    //   [51.51, -0.047]
    // ]).addTo(this.map);

    // Ensure proper rendering
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }


  confirmDestination() {
    if (!this.selectedDestination) 
      return;  
    
    console.log('Booking with destination:', this.selectedDestination);
    /*
    this.bookingService.createBooking(userId, this.destination).subscribe({
      next: (res) => {
        console.log('Booking successful:', res);
        this.submitting = false;
        this.router.navigate(['/booking-confirmation']); // Navigate to a confirmation page
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        this.submitting = false;
      },
    });
    */

    
    this.router.navigate(['/booking'], { queryParams: { lat: this.selectedDestination.lat, lng: this.selectedDestination.lng }});

  }
}