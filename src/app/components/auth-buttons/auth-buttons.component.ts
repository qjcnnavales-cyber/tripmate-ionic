import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService, AppUser } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IonIcon, IonMenuButton, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline, businessOutline, arrowBackOutline, shieldCheckmarkOutline, shieldOutline, personOutline, homeOutline } from 'ionicons/icons';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-buttons',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonMenuButton],
  template: `
    <header class="main-top-nav" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 15px clamp(20px, 5vw, 64px); box-sizing: border-box;">
      <div class="nav-left" style="display: flex; align-items: center; gap: 16px; flex: 1;">
        <ion-menu-button style="color: white;"></ion-menu-button>
        <a routerLink="/homepage" class="logo" style="display: flex; align-items: center; gap: 9px; text-decoration: none;">
          <img src="assets/images/tripmate.svg" alt="TripMate" style="height: 36px;">
        </a>
      </div>

      <div class="nav-center hide-mobile" style="display: flex; align-items: center; justify-content: center; gap: 36px; flex: 2;">
        <a routerLink="/stays" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Stays</a>
        <a routerLink="/how-it-works" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">How it works</a>
        <a *ngIf="user === null" routerLink="/become-host" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Become a Host</a>
        <a *ngIf="user && user !== 'loading' && user.role === 'guest'" (click)="confirmBecomeHost($event)" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500; cursor: pointer;">Become a Host</a>
        <a *ngIf="user && user !== 'loading' && user.role === 'host'" routerLink="/dashboard" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Host Dashboard</a>
        <a *ngIf="user && user !== 'loading' && user.role === 'admin'" routerLink="/admin" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Admin Dashboard</a>
      </div>

      <div class="nav-right" style="display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex: 1;">
        <a *ngIf="!isHomepage" routerLink="/homepage" class="hide-mobile" style="display: flex; align-items: center; gap: 6px; color: white; text-decoration: none; font-size: 13.5px; font-weight: 500; margin-right: 8px;">
          <ion-icon name="arrow-back-outline"></ion-icon> Back to home
        </a>

        <!-- Skeleton Loader -->
        <ng-container *ngIf="user === 'loading'">
          <div style="width: 80px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 100px; animation: pulse 1.5s infinite;"></div>
          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 50%; animation: pulse 1.5s infinite;"></div>
        </ng-container>

        <!-- Guest state buttons -->
        <ng-container *ngIf="user === null">
          <a routerLink="/login" class="hide-mobile" style="color: white; font-size: 14.5px; font-weight: 500; text-decoration: none; cursor: pointer; margin-right: 8px;">Log in</a>
          <a routerLink="/signup" class="btn-primary" style="background: var(--tm-color-primary, #FF6B4A); color: white; padding: 10px 22px; border-radius: 100px; font-size: 14.5px; font-weight: 600; text-decoration: none; border:none; cursor: pointer;">Get started</a>
        </ng-container>

        <!-- Logged-in state dropdown -->
        <div class="user-menu-container" *ngIf="user && user !== 'loading'" style="position: relative; display: flex; align-items: center; gap: 10px;">
          <!-- Role badge in header next to avatar -->
          <span class="role-badge" [ngClass]="'badge-' + user.role">{{ user.role }}</span>

          <button class="user-avatar-btn" (click)="toggleDropdown($event)" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); background: var(--tm-color-primary, #FF6B4A); color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img *ngIf="user.avatar_url" [src]="user.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" />
            <span *ngIf="!user.avatar_url">{{ initials }}</span>
          </button>

          <div class="user-dropdown" *ngIf="dropdownOpen" (click)="$event.stopPropagation()" style="position: absolute; top: 56px; right: 0; width: 260px; background: #0F2E25; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); z-index: 9999; color: #FFFFFF; display: flex; flex-direction: column; overflow: hidden;">
            <div class="dropdown-header" style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(0,0,0,0.2);">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: 700; font-size: 1.05rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ user.full_name || 'TripMate User' }}</span>
                <span class="role-badge" [ngClass]="'badge-' + user.role">{{ user.role }}</span>
              </div>
              <div style="font-size: 0.85rem; color: #F8F5EE; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ user.email }}</div>
            </div>
            
            <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <a routerLink="/profile" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="person-circle-outline"></ion-icon> My Profile
              </a>
              <a routerLink="/dashboard" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="calendar-outline"></ion-icon> My Trips
              </a>
              <!-- Host: My Listings -->
              <a *ngIf="user.role === 'host'" routerLink="/dashboard" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="home-outline"></ion-icon> My Listings
              </a>
              <a routerLink="/wishlist" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="heart-outline"></ion-icon> Wishlist
              </a>
              <!-- Admin Dashboard if Admin -->
              <a *ngIf="user.role === 'admin'" routerLink="/admin" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="shield-checkmark-outline"></ion-icon> Admin Dashboard
              </a>
            </div>

            <div style="padding: 8px 0;">
              <!-- Become a Host if Guest -->
              <a *ngIf="user.role === 'guest'" (click)="confirmBecomeHost($event)" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer;">
                <ion-icon name="business-outline"></ion-icon> Become a Host
              </a>
              <a (click)="logout()" class="dropdown-item" style="padding: 12px 20px; color: #FF6B4A; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer;">
                <ion-icon name="log-out-outline"></ion-icon> Log out
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .dropdown-item:hover { background: rgba(255,255,255,0.05); }
    @media (max-width: 768px) { .hide-mobile { display: none !important; } }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class AuthButtonsComponent implements OnInit, OnDestroy {
  user: AppUser | null | 'loading' = 'loading';
  initials: string = '';
  dropdownOpen = false;
  isHomepage = false;

  private sub!: Subscription;
  private routerSub!: Subscription;
  private clickListener!: (e: MouseEvent) => void;

  constructor(
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline, businessOutline, arrowBackOutline, shieldCheckmarkOutline, shieldOutline, personOutline, homeOutline });
  }

  ngOnInit() {
    this.sub = this.auth.currentUser$.subscribe(user => {
      this.user = user as any;
      if (user && user !== 'loading' && (user as any).full_name) {
        this.initials = (user as any).full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      } else {
        this.initials = 'G';
      }
      this.cdr.detectChanges();
    });

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomepage = event.url === '/' || event.url === '/homepage' || event.urlAfterRedirects === '/homepage';
    });
    
    this.isHomepage = this.router.url === '/' || this.router.url === '/homepage';

    this.clickListener = (e: MouseEvent) => {
      this.dropdownOpen = false;
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
    document.removeEventListener('click', this.clickListener);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  async confirmBecomeHost(event?: Event) {
    if (event) event.stopPropagation();
    this.dropdownOpen = false;

    const alert = await this.alertCtrl.create({
      header: 'Switch to Host Account?',
      message: 'You will be able to list properties and manage bookings.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async () => {
            try {
              await this.auth.becomeHost();
              const toast = await this.toastCtrl.create({
                message: 'Welcome, host! You can now list properties.',
                duration: 3000,
                color: 'success',
                position: 'bottom'
              });
              await toast.present();
              await this.router.navigateByUrl('/host-dashboard');
            } catch (err: any) {
              console.error('Error becoming host:', err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.auth.signOut();
    this.dropdownOpen = false;
  }
}




