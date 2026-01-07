import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  firstName: string = '';
  lastName: string = '';
  role: string = '';
  email: string = '';
  address: string = '';
  createdAt?: Date;

  totalTrips: number = 0;
  completedTrips: number = 0;

  loading: boolean = false;

  editProfile = {
    firstName: '',
    lastName: '',
    address: ''
  };

  saving = false;

  constructor(private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.auth.verifySelf().subscribe({
      next: (response) => {
        console.log(response);
        this.firstName = response.firstName;
        this.lastName = response.lastName;
        this.role = response.role;
        this.email = response.email;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditProfile(){
    this.editProfile = {
      firstName: this.firstName,
      lastName: this.lastName,
      address: this.address
    }

    const modalElement = document.getElementById('editProfileModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  saveProfile() {
    this.saving = true;

    // Example payload
    const payload = {
      firstName: this.editProfile.firstName,
      lastName: this.editProfile.lastName,
      address: this.editProfile.address
    };

    this.auth.updateSelf(payload).subscribe({
      next: () => {
        // Update local user
        this.firstName = payload.firstName;
        this.lastName = payload.lastName;
        this.address = payload.address;

        this.saving = false;

        // Close modal
        const modalEl = document.getElementById('editProfileModal');
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        modal.hide();
      },
      error: () => {
        this.saving = false;
        alert('Failed to update profile');
      }
    });
  }

}
