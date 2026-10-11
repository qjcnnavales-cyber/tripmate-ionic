
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonBackButton
} from '@ionic/angular';

import { Subscription } from 'rxjs';
import { AuthService, AppUser } from '../services/auth.service';
import { BookingsService, Booking } from '../services/bookings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    RouterLinkActive,
    AuthButtonsComponent,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenuButton,
    IonBackButton
  ]
})
export class DashboardPage implements OnInit, OnDestroy {

  user: AppUser | null = null;
  initials: string = '';

  allBookings: Booking[] = [];
  currentFilter: string = 'upcoming';

  categories: { [key: string]: Booking[] } = {
    upcoming: [],
    past: [],
    pending: [],
    cancelled: []
  };

  userDropdownOpen = false;
  sidebarOpen = false;
  isLoading = true;

  private authSubscription?: Subscription;

  constructor(
    private auth: AuthService,
    private bookingsService: BookingsService,
    private router: Router
  ) {}

  ngOnInit() {

    // Wait for authentication to finish before redirecting.
    this.authSubscription = this.auth.currentUser$.subscribe(async (u) => {

      if (u === 'loading') {
        this.isLoading = true;
        return;
      }

      // User is confirmed to be logged out.
      if (!u) {
        this.user = null;
        this.initials = '';
        this.allBookings = [];
        this.categories = {
          upcoming: [],
          past: [],
          pending: [],
          cancelled: []
        };
        this.isLoading = false;

        await this.router.navigate(['/login'], {
          queryParams: { redirect: 'dashboard' }
        });
        return;
      }

      // User is authenticated.
      const authenticatedUser = u as AppUser;

      // Avoid unnecessary reloads for the same user.
      if (this.user?.id === authenticatedUser.id) {
        return;
      }

      this.user = authenticatedUser;

      this.initials = (authenticatedUser.full_name || 'Guest')
        .split(' ')
        .filter((name: string) => name.length > 0)
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      await this.loadBookings();
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  async loadBookings() {
    this.isLoading = true;

    try {
      this.allBookings = await this.bookingsService.getUserBookings();
      this.categorizeBookings();
    } catch (e) {
      console.error('loadBookings error:', e);
    } finally {
      this.isLoading = false;
    }
  }

  categorizeBookings() {
    const now = new Date();

    this.categories = {
      upcoming: [],
      past: [],
      pending: [],
      cancelled: []
    };

    this.allBookings.forEach(booking => {
      const checkout = new Date(booking.check_out);

      if (booking.status === 'cancelled') {
        this.categories['cancelled'].push(booking);
      } else if (booking.status === 'pending') {
        this.categories['pending'].push(booking);
      } else if (!isNaN(checkout.getTime()) && checkout < now) {
        this.categories['past'].push(booking);
      } else {
        this.categories['upcoming'].push(booking);
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.sidebarOpen = false;
  }

  getFilterTitle() {
    const titles: { [key: string]: string } = {
      upcoming: 'Upcoming Trips',
      past: 'Past Trips',
      pending: 'Pending Requests',
      cancelled: 'Cancelled Trips'
    };

    return titles[this.currentFilter] || '';
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await this.bookingsService.cancelBooking(bookingId);
      await this.loadBookings();
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Unable to cancel booking. Please try again.');
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  peso(n: number) {
    return '₱' + Math.round(Number(n) || 0).toLocaleString('en-PH');
  }

  writeReview(bookingId: string) {
    alert('Reviews coming soon!');
  }

  async logout(event: Event) {
    event.preventDefault();

    try {
      await this.auth.signOut();
      this.userDropdownOpen = false;
      await this.router.navigate(['/homepage']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
