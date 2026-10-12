
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
  IonBackButton,
  IonIcon,
  AlertController,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService, AppUser } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
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
    IonBackButton,
    IonIcon
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  user: AppUser | null = null;
  initials = '';
  userDropdownOpen = false;

  toastMessage = '';
  showToast = false;
  toastError = false;

  account = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  };

  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notifications = {
    booking: true,
    payment: true,
    reminders: true,
    promo: false
  };

  private authSubscription?: Subscription;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ homeOutline, personOutline, shieldCheckmarkOutline });
  }

  ngOnInit() {
    this.authSubscription = this.auth.currentUser$.subscribe(u => {
      // Wait for session restoration.
      if (u === 'loading') return;

      // Redirect only after authentication is resolved.
      if (!u) {
        this.user = null;
        void this.router.navigate(['/login'], {
          queryParams: { redirect: 'profile' }
        });
        return;
      }

      this.user = u as AppUser;
      this.populateUserInfo();
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  populateUserInfo() {
    if (!this.user) return;

    const parts = (this.user.full_name || '').trim().split(/\s+/);

    this.account.firstName = parts[0] || '';
    this.account.lastName = parts.slice(1).join(' ');
    this.account.email = this.user.email || '';
    this.account.phone = this.user.phone || '';

    this.initials = (this.user.full_name || 'Guest')
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const saved = localStorage.getItem(
      `tripmate_notifications_${this.user.id}`
    );

    if (saved) {
      try {
        this.notifications = {
          ...this.notifications,
          ...JSON.parse(saved)
        };
      } catch (error) {
        console.error('Notification settings error:', error);
      }
    }
  }

  displayToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.toastError = isError;
    this.showToast = true;

    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  triggerUpload() {
    const fileInput = document.getElementById(
      'avatarUpload'
    ) as HTMLInputElement | null;

    fileInput?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.displayToast('Please select an image file.', true);
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result;

      if (typeof base64 !== 'string' || !this.user) return;

      try {
        await this.auth.updateProfile({ avatar_url: base64 });
        this.user = { ...this.user, avatar_url: base64 };
        this.displayToast('Profile photo updated!');
      } catch (error) {
        console.error('Avatar update error:', error);
        this.displayToast('Unable to update profile photo.', true);
      }
    };

    reader.readAsDataURL(file);
  }

  onAccountSubmit() {
    const { firstName, lastName, email } = this.account;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      this.displayToast('Please fill in all required fields.', true);
      return;
    }

    if (!this.isValidEmail(email.trim())) {
      this.displayToast('Please enter a valid email address.', true);
      return;
    }

    if (this.user) {
      const updated = {
        ...this.user,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: this.account.phone
      };

      // Preserves the existing mock-session implementation.
      localStorage.setItem(
        'tripmate_mock_session',
        JSON.stringify(updated)
      );

      this.user = updated as AppUser;
      this.populateUserInfo();
      this.displayToast('Profile updated successfully!');
    }
  }

  onSecuritySubmit() {
    const { newPassword, confirmPassword } = this.security;

    if (!newPassword || !confirmPassword) {
      this.displayToast('Please fill in all password fields.', true);
      return;
    }

    if (newPassword.length < 8) {
      this.displayToast(
        'New password must be at least 8 characters.',
        true
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      this.displayToast('New passwords do not match.', true);
      return;
    }

    // Existing mock password storage.
    const users = JSON.parse(
      localStorage.getItem('tripmate_mock_users') || '[]'
    );

    const idx = users.findIndex(
      (u: any) => u.id === this.user?.id
    );

    if (idx !== -1) {
      users[idx].password = newPassword;

      localStorage.setItem(
        'tripmate_mock_users',
        JSON.stringify(users)
      );
    }

    this.displayToast('Password updated successfully!');

    this.security = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  onNotificationChange() {
    if (!this.user) return;

    localStorage.setItem(
      `tripmate_notifications_${this.user.id}`,
      JSON.stringify(this.notifications)
    );
  }

  async deleteAccount() {
    if (!confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone.'
    )) return;

    if (this.user) {
      const users = JSON.parse(
        localStorage.getItem('tripmate_mock_users') || '[]'
      );

      localStorage.setItem(
        'tripmate_mock_users',
        JSON.stringify(
          users.filter((u: any) => u.id !== this.user?.id)
        )
      );
    }

    await this.auth.signOut();
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  async confirmBecomeHost() {
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

  async logout(event: Event) {
    event.preventDefault();
    await this.auth.signOut();
  }
}
