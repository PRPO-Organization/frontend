import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ratings } from '../../services/ratings';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-rate-driver',
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-driver.html',
  styleUrl: './rate-driver.scss'
})
export class RateDriver implements OnInit{
  driverId!: number;
  rideId!: number;

  rating = 5;
  comment = '';
  loading = false;
  error = '';
  success = '';

  constructor(private route: ActivatedRoute, private ratings: Ratings, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.driverId = +params['driverId'];
      this.rideId = +params['rideId'];
    });
  }

  submitRating() {
    if (this.rating < 1 || this.rating > 5) {
      this.error = 'Rating must be between 1 and 5';
      return;
    }

    this.loading = true;
    this.error = '';

    this.ratings.rateUser(this.driverId, this.rating, this.comment).subscribe({
      next: () => {
        this.success = 'Thank you for your feedback!';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/my-rides']);
        }, 1500);
      },
      error: () => {
        this.error = 'Failed to submit rating';
        this.loading = false;
      }
    });
  }
}
