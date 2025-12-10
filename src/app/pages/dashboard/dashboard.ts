import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = '';

  constructor(private auth: Auth) {}
  
  loggedIn$: any;

  ngOnInit(): void {
    this.loggedIn$ = this.auth.loggedIn$;

    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response);
        this.firstName = response.firstName;
        this.lastName = response.lastName;
        this.role = response.role;
      }
    })
  }
}
