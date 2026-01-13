import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ratings } from '../../services/ratings';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-rate-driver',
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-driver.html',
  styleUrl: './rate-driver.scss'
})
export class RateDriver implements OnInit{
  driverId!: number;
  rideId!: number;
  userId: number | null = null;

  rating = 5;
  comment = '';
  loading = false;
  error = '';
  success = '';

  constructor(private route: ActivatedRoute, private ratings: Ratings, private router: Router, 
    private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.driverId = +params['driverId'];
      this.rideId = +params['rideId'];
    });

    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response)
        this.userId = response.id;
      },
      error: (err) => console.error(err)
    });
  }

  submitRating() {
    if (this.rating < 1 || this.rating > 5) {
      this.error = 'Rating must be between 1 and 5';
      return;
    }

    if(!this.comment)
      this.comment = '';

    this.loading = true;
    this.error = '';
    console.log(this.userId);

    this.ratings.rateUser(this.userId!, this.driverId, this.rating, this.comment).subscribe({
      next: (response) => {
        this.success = 'Thank you for your feedback!';
        this.loading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/my-rides']);
        }, 4000);
      },
      error: (err) => {
        this.error = 'Failed to submit rating';
        this.loading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }
}
