import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { NotificationsHistory } from './pages/notifications-history/notifications-history';
import { Driver } from './driver/driver';
import { LeafletMapComponent } from './leaflet-map/leaflet-map';
import { Booking } from './pages/booking/booking';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'notifications-history', component: NotificationsHistory },
  { path: 'driver', component: Driver },
  { path: 'map', component: LeafletMapComponent },
  { path: 'booking', component: Booking },
  { path: 'profile', component: Profile }
];
