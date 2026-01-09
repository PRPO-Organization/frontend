import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  password: string = '';
  passwordC: string = '';
  error: string = '';
  success: string = '';
  isDriver: boolean = false;
  loading: boolean = false;

  constructor(private auth: Auth, private router: Router) {}

  onRegister() {
    if(this.password !== this.passwordC){
      this.error = 'Passwords must match'
      return;
    }

    let userRole = 'CUSTOMER';
    if(this.isDriver)
      userRole = 'DRIVER';

    this.loading = true;
    this.auth.register({ firstName: this.firstName, lastName: this.lastName, address: this.address,
      email: this.email, password: this.password, role: userRole }).subscribe({
      next: (res) => {
        console.log('Registration successful', res);
        this.loading = false;
        this.router.navigate(['/login']); // Navigate to login on success
      },
      error: (err) => {
        console.error('Registration error', err);
        this.loading = false;
        this.error = 'Registration failed';
      },
      complete: () => { this.loading = false; }
    });
  }
}
