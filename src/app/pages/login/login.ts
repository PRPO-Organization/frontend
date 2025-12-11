import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Notifications } from '../../services/notifications';

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

  constructor(private auth: Auth, private router: Router, private notifs: Notifications) {}

  onLogin() {
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login successful', res);
        this.loading = false;
        this.auth.setToken(res.token);
        this.auth.setLoggedIn();
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Login error', err);
        this.loading = false;
        this.error = 'Login failed';
      },
      complete: () => { 
        this.loading = false; 
        this.notifs.getAccountNotifications();
        this.notifs.startSse();
      }
    });
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
