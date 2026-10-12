import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline, peopleOutline, moonOutline, chatbubbleOutline, checkmarkCircleOutline, checkmarkOutline, starOutline, printOutline } from 'ionicons/icons';
import { AuthService, AppUser } from '../services/auth.service';
import { BookingsService, Booking } from '../services/bookings.service';
import { PdfService } from '../services/pdf.service';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton, IonButtons, IonButton, IonIcon, IonSpinner, AuthButtonsComponent]
})
export class ReservationsPage implements OnInit {
  user: AppUser | null = null;
  allBookings: Booking[] = [];
  categories: { [key: string]: Booking[] } = { upcoming: [], past: [], pending: [], cancelled: [] };
  currentFilter: string = 'upcoming';
  isLoading = true;

  constructor(private auth: AuthService, private bookingsService: BookingsService, private router: Router, private pdfService: PdfService) {
    addIcons({ calendarOutline, locationOutline, peopleOutline, moonOutline, chatbubbleOutline, checkmarkCircleOutline, checkmarkOutline, starOutline, printOutline });
  }

  ngOnInit() {
    this.auth.currentUser$.subscribe(async (user) => {
      if (user === 'loading') return;
      this.user = (user as any) as AppUser | null;
      if (user) {
        await this.loadBookings();
      } else {
        this.isLoading = false;
      }
    });
  }

  async loadBookings() {
    this.isLoading = true;
    try {
      this.allBookings = await this.bookingsService.getUserBookings();
      this.categorizeBookings();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  categorizeBookings() {
    const now = new Date();
    this.categories = { upcoming: [], past: [], pending: [], cancelled: [] };

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
  }

  peso(n: number | undefined | null): string {
    return '\u20B1' + Math.round(Number(n) || 0).toLocaleString('en-PH');
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    this.isLoading = true;
    try {
      await this.bookingsService.cancelBooking(bookingId);
      await this.loadBookings();
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }

  printBooking(booking: Booking) {
    this.pdfService.generateSingleReservationPdf(booking);
  }

  printAllBookings() {
    this.pdfService.generateAllReservationsPdf(this.allBookings);
  }
}







