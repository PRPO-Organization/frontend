import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Notifications } from '../../services/notifications';
import { LocationTracking } from '../../services/location-tracking';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading: boolean = false;
  userId: number = -1;
  userRole: string = '';

  constructor(private auth: Auth, private router: Router, private notifs: Notifications, private tracking: LocationTracking) {}

  onLogin() {
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login successful', res);
        this.loading = false;
        this.auth.setToken(res.token);
        this.auth.setLoggedIn();
        this.enableTracking();
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Login error', err);
        this.loading = false;
        this.error = 'Login failed';
      },
      complete: () => { 
        this.loading = false; 
        this.notifs.getUnreadAccountNotifications();
        this.notifs.startSse();
      }
    });
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  enableTracking(){
    this.auth.verifySelf().subscribe({
      next: (response) => {
        this.userId = response.id;
        this.userRole = response.role;
        this.tracking.startTracking(this.userId, this.userRole);
      }
    });
  }
}
