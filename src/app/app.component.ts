import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline, businessOutline, layersOutline, phonePortraitOutline, documentTextOutline, shieldHalfOutline, homeOutline, bedOutline, informationCircleOutline, keyOutline, mapOutline, walletOutline, calendarOutline, codeSlashOutline, mailOutline, addOutline, createOutline, trashOutline, airplaneOutline, restaurantOutline, personCircleOutline, heartOutline, logOutOutline, personOutline, shieldCheckmarkOutline, shieldOutline } from 'ionicons/icons';
import { AuthService, AppUser } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
    styles: [`
    ion-menu {
      --ion-background-color: #0F2E25;
      --ion-text-color: #FFFFFF;
    }
    .menu-toolbar {
      --background: #0F2E25;
      --color: #FFFFFF;
      --border-width: 0;
      padding: 16px 20px;
    }
    .menu-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      font-size: 24px;
    }
    .brand-text h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #FFFFFF;
      font-family: var(--tm-font-serif, serif);
    }
    .brand-text p {
      margin: 0;
      font-size: 0.75rem;
      color: #F8F5EE;
      opacity: 0.8;
    }
    .menu-content {
      --background: #0F2E25;
    }
    .side-profile {
      display: flex;
      align-items: center;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 10px;
    }
    .side-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--tm-color-primary, #FF6B4A);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      margin-right: 15px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .side-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .side-info {
      overflow: hidden;
    }
    .side-name {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: bold;
      color: #FFFFFF;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .side-email {
      margin: 0;
      font-size: 0.85rem;
      color: #F8F5EE;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .menu-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.5);
      padding: 16px 20px 8px;
      text-transform: uppercase;
    }
    .menu-list {
      background: transparent;
      padding: 0;
    }
    ion-item {
      --background: transparent;
      --color: #FFFFFF;
      --padding-start: 20px;
      --inner-padding-end: 20px;
      --min-height: 50px;
      font-size: 0.95rem;
      margin-bottom: 4px;
      cursor: pointer;
      border-left: 4px solid transparent;
      transition: all 0.2s ease;
    }
    ion-item::part(native) {
      padding-top: 6px;
      padding-bottom: 6px;
    }
    ion-item:hover, ion-item.active-menu-item {
      --background: rgba(255,255,255,0.05);
      border-left: 4px solid var(--tm-color-primary, #FF6B4A);
    }
    ion-icon {
      color: #F8F5EE;
      font-size: 1.2rem;
      margin-right: 16px;
    }
    .menu-divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 12px 20px;
    }
    .menu-footer {
      padding: 30px 20px;
      color: rgba(255,255,255,0.5);
      font-size: 0.8rem;
    }
    .menu-footer p { margin: 0; }
  `],
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, RouterLink, CommonModule],
})
export class AppComponent implements OnInit, OnDestroy {
  user: AppUser | null | undefined = undefined;
  initials: string = '';
  private authSub!: Subscription;

  constructor(private authService: AuthService) {
    addIcons({ timeOutline, businessOutline, layersOutline, phonePortraitOutline, documentTextOutline, shieldHalfOutline, homeOutline, bedOutline, informationCircleOutline, keyOutline, mapOutline, walletOutline, calendarOutline, codeSlashOutline, mailOutline, addOutline, createOutline, trashOutline, airplaneOutline, restaurantOutline, personCircleOutline, heartOutline, logOutOutline, personOutline, shieldCheckmarkOutline, shieldOutline });
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.user = (user === 'loading' ? null : user) as AppUser | null | undefined;
      if (user && user !== 'loading' && (user as any)?.full_name) {
        this.initials = (user as any).full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      } else {
        this.initials = 'G';
      }
    });
  }

  
  triggerUpload() {
    const fileInput = document.getElementById('sideMenuAvatarUpload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64 = e.target.result;
      if (this.user) {
        this.user.avatar_url = base64;
        await this.authService.updateProfile({ avatar_url: base64 });
      }
    };
    reader.readAsDataURL(file);
  }

  async logout() { await this.authService.signOut(); }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }
}
















