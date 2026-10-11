import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

interface Stay {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  img: string;
  link: string;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.page.html',
  styleUrls: ['./homepage.page.scss'],
  imports: [AuthButtonsComponent, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class HomepagePage implements OnInit, OnDestroy {
  featuredStays: Stay[] = [];
  currentIndex = 0;
  private autoplayTimer: any;

  destination = '';
  checkin = '';
  checkout = '';
  isMobileNavOpen = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    this.featuredStays = await this.getFeaturedStays();
    if (this.featuredStays.length > 0) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  async getFeaturedStays(): Promise<Stay[]> {
    return [
      {
        id: "stay-1",
        label: "01",
        title: "Tropical Beachfront Villas",
        subtitle: "Discover paradise with ocean views in Siargao & Palawan.",
        img: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/630810990.jpg?k=f0a258fd952f19c7285f4e99e64664bc423cd779166b639a29d87037cb90b2ac&o=",
        link: "stays.html?search=Beachfront"
      },
      {
        id: "stay-2",
        label: "02",
        title: "Cozy Mountain Cabins",
        subtitle: "Escape to the cool pine breezes and scenic views of Baguio.",
        img: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/184656762.jpg?k=03df05cdd232e5aec61fb79b29314d5d84e8eb5904f33efa84a05dd9b1800e80&o=",
        link: "stays.html?search=Cabin"
      },
      {
        id: "stay-3",
        label: "03",
        title: "Luxury Island Resorts",
        subtitle: "Unwind with world-class amenities and pristine beaches.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7DjJY2wWxNmj-AVl2FuBM8tT99YqVb3U2AO-5srMWWAkFKwRowBoNAb9I&s=10",
        link: "stays.html?search=Resort"
      }
    ];
  }

  goTo(index: number) {
    this.currentIndex = index;
    this.resetAutoplay();
  }

  next() {
    if (this.featuredStays.length === 0) return;
    this.goTo((this.currentIndex + 1) % this.featuredStays.length);
  }

  prev() {
    if (this.featuredStays.length === 0) return;
    this.goTo((this.currentIndex - 1 + this.featuredStays.length) % this.featuredStays.length);
  }

  startAutoplay() {
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoplay();
      this.autoplayTimer = setInterval(() => this.next(), 4500);
    }
  }

  stopAutoplay() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
  }

  resetAutoplay() {
    this.startAutoplay();
  }

  onMouseEnter() { this.stopAutoplay(); }
  onMouseLeave() { this.startAutoplay(); }

  touchStartX = 0;
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].screenX;
    const threshold = 30;
    if (touchEndX < this.touchStartX - threshold) {
      this.next();
    } else if (touchEndX > this.touchStartX + threshold) {
      this.prev();
    }
  }

  onSearch() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.checkin) localStorage.setItem('trip_checkin', this.checkin);
      if (this.checkout) localStorage.setItem('trip_checkout', this.checkout);
    }
    const queryParams: any = {};
    if (this.destination) queryParams.search = this.destination;
    if (this.checkin) queryParams.checkin = this.checkin;
    if (this.checkout) queryParams.checkout = this.checkout;
    this.router.navigate(['/stays'], { queryParams });
  }

  searchDestination(dest: string) {
    this.router.navigate(['/stays'], { queryParams: { search: dest } });
  }

  onFeaturedStayClick() {
    if (this.featuredStays.length > 0) {
      const stay = this.featuredStays[this.currentIndex];
      const categoryMap: { [key: string]: string } = {
        'stay-1': 'Beachfront',
        'stay-2': 'Cabin',
        'stay-3': 'Resort'
      };
      const term = categoryMap[stay.id] || stay.title;
      this.router.navigate(['/stays'], { queryParams: { search: term } });
    }
  }

  toggleMobileNav() {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }
}



