import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [AuthButtonsComponent, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class SignupPage implements OnInit, OnDestroy {
  mode: 'guest' | 'host' = 'guest';
  fullName = '';
  email = '';
  businessName = '';
  password = '';
  confirmPassword = '';
  agreed = false;

  nameError = '';
  emailError = '';
  passwordError = '';
  confirmError = '';
  termsError = false;

  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  toastMessage = '';
  showToast = false;
  toastError = false;

  private authSub?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe(user => {
      if (user && user !== 'loading') {
        this.router.navigateByUrl('/homepage');
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'host') this.mode = 'host';
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  setMode(mode: 'guest' | 'host') {
    this.mode = mode;
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async signup() {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmError = '';
    this.termsError = false;

    let hasError = false;
    if (!this.fullName.trim()) { this.nameError = 'Enter your full name.'; hasError = true; }
    if (!this.isValidEmail(this.email.trim())) { this.emailError = 'Enter a valid email address.'; hasError = true; }
    if (this.password.length < 8) { this.passwordError = 'Password must be at least 8 characters.'; hasError = true; }
    if (this.confirmPassword !== this.password || !this.confirmPassword) { this.confirmError = "Passwords don't match."; hasError = true; }
    if (!this.agreed) {
      this.displayToast('Please agree to the Terms of Service to continue.', true);
      this.termsError = true;
      hasError = true;
    }
    if (hasError) return;

    this.isSubmitting = true;
    try {
      const user = await this.auth.signUp({
        full_name: this.fullName.trim(),
        email: this.email.trim(),
        password: this.password,
        role: this.mode,
        businessName: this.mode === 'host' ? this.businessName.trim() : undefined,
      });
      const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there';
      this.displayToast(`Welcome to TripMate, ${firstName}!`, false);
      await this.router.navigateByUrl('/homepage');
    } catch (error: any) {
      this.emailError = error.message || 'Unable to create account.';
    } finally {
      this.isSubmitting = false;
    }
  }

  displayToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.toastError = isError;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3200);
  }
}