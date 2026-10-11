import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [AuthButtonsComponent, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class SignupPage implements OnInit {
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

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // If already logged in, redirect away
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/homepage');
      return;
    }
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'host') this.mode = 'host';
    });
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
      this.displayToast(`Welcome to TripMate, ${user.full_name.split(' ')[0]}!`, false);
      setTimeout(() => this.router.navigateByUrl('/homepage'), 800);
    } catch (error: any) {
      this.emailError = error.message || 'Unable to create account.';
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

