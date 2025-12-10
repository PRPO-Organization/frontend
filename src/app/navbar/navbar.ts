import { Component, OnInit } from '@angular/core';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnInit {

  constructor(private auth: Auth, private router: Router) {}

  loggedIn$: any;

  ngOnInit(): void {
    this.loggedIn$ = this.auth.loggedIn$;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'])
  }

  toRegister(){
    this.router.navigate(['/register']);
  }
}
