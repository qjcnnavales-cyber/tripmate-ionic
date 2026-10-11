
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
import {
  WishlistService,
  WishlistItem
} from '../services/wishlist.service';
import {
  PropertiesService,
  Property
} from '../services/properties.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
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
export class WishlistPage implements OnInit, OnDestroy {
  user: AppUser | null = null;
  initials = '';

  wishlist: WishlistItem[] = [];
  propertiesMap: Record<string, Property> = {};

  currentSort = 'recent';
  currentView = 'grid';

  userDropdownOpen = false;
  isLoading = true;

  private authSubscription?: Subscription;

  constructor(
    private auth: AuthService,
    private wishlistService: WishlistService,
    private propertiesService: PropertiesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.auth.currentUser$.subscribe(u => {

      // Wait for authentication to finish.
      if (u === 'loading') {
        this.isLoading = true;
        return;
      }

      // Redirect only when the user is confirmed logged out.
      if (!u) {
        this.user = null;
        this.initials = '';
        this.wishlist = [];
        this.propertiesMap = {};
        this.isLoading = false;

        void this.router.navigate(['/login'], {
          queryParams: { redirect: 'wishlist' }
        });
        return;
      }

      const authenticatedUser = u as AppUser;

      // Avoid reloading the same user's wishlist unnecessarily.
      if (this.user?.id === authenticatedUser.id) {
        return;
      }

      this.user = authenticatedUser;

      this.initials = (authenticatedUser.full_name || 'Guest')
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      void this.loadWishlist();
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  async loadWishlist() {
    this.isLoading = true;

    try {
      const allProps =
        await this.propertiesService.getAllProperties();

      this.propertiesMap = {};

      allProps.forEach(p => {
        this.propertiesMap[p.id] = p;
      });

      this.wishlist =
        await this.wishlistService.getWishlist();

      this.sortWishlist();

    } catch (error) {
      console.error('loadWishlist error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getProperty(propertyId: string): Property | null {
    return this.propertiesMap[propertyId] ?? null;
  }

  sortWishlist() {
    this.wishlist.sort((a, b) => {
      const pA = this.propertiesMap[a.property_id];
      const pB = this.propertiesMap[b.property_id];

      if (!pA || !pB) return 0;

      if (this.currentSort === 'price-asc') {
        return pA.price_per_night - pB.price_per_night;
      }

      if (this.currentSort === 'price-desc') {
        return pB.price_per_night - pA.price_per_night;
      }

      if (this.currentSort === 'rating') {
        return (pB.average_rating ?? 0) -
               (pA.average_rating ?? 0);
      }

      return new Date(b.created_at ?? 0).getTime() -
             new Date(a.created_at ?? 0).getTime();
    });
  }

  onSortChange() {
    this.sortWishlist();
  }

  setView(view: string) {
    this.currentView = view;
  }

  async removeFromWishlist(propertyId: string) {
    try {
      await this.wishlistService.removeFromWishlist(propertyId);

      this.wishlist = this.wishlist.filter(
        w => w.property_id !== propertyId
      );
    } catch (error) {
      console.error('Remove wishlist error:', error);
    }
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  async logout(event: Event) {
    event.preventDefault();
    await this.auth.signOut();
  }
}
