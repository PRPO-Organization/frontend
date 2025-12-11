import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Notifications } from '../../services/notifications';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-history',
  imports: [CommonModule],
  templateUrl: './notifications-history.html',
  styleUrl: './notifications-history.scss',
})
export class NotificationsHistory implements OnInit {

  notifications: any[] = [];
  paginatedNotifications: any[] = [];
  pageSize = 20;
  currentPage = 1;
  loading: boolean = false;

  constructor(private auth: Auth, private notifs: Notifications, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(){
    this.loading = true;

    this.notifs.getAllNotifications().subscribe({
      next: (response) => {
        this.notifications = response;
        this.notifications.reverse();
        this.updatePaginatedNotifications();
        console.log(this.paginatedNotifications);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error((err));
        this.loading = false;
      }
    });
    
  }

  updatePaginatedNotifications(){
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedNotifications = this.notifications.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.notifications.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedNotifications();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
