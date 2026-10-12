import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [AuthButtonsComponent, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class LoginPage implements OnInit, OnDestroy {
  mode: 'guest' | 'host' = 'guest';
  email = '';
  password = '';

  emailError = '';
  passwordError = '';
  isSubmitting = false;
  showPassword = false;
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
        const redirectParam = this.route.snapshot.queryParams['redirect'];
        if (redirectParam) {
          this.router.navigateByUrl(redirectParam);
        } else if (user.role === 'admin') {
          this.router.navigateByUrl('/admin');
        } else if (user.role === 'host') {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.router.navigateByUrl('/homepage');
        }
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'host') this.mode = 'host';
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  setMode(mode: 'guest' | 'host') { this.mode = mode; }
  togglePassword() { this.showPassword = !this.showPassword; }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async login() {
    this.emailError = '';
    this.passwordError = '';

    let targetEmail = this.email.trim();
    if (targetEmail.toLowerCase() === 'admin') {
      targetEmail = 'admin@tripmate.app';
    }

    let hasError = false;
    if (!targetEmail || !this.isValidEmail(targetEmail)) {
      this.emailError = 'Enter a valid email.'; hasError = true;
    }
    if (!this.password) { this.passwordError = 'Password is required.'; hasError = true; }
    if (hasError) return;

    this.isSubmitting = true;
    try {
      const user = await this.auth.signIn(targetEmail, this.password);
      const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there';
      this.displayToast(`Welcome back, ${firstName}!`);
      const redirectParam = this.route.snapshot.queryParams['redirect'];
      let destination = redirectParam;
      if (!destination) {
        if (user?.role === 'admin') {
          destination = '/admin';
        } else if (user?.role === 'host') {
          destination = '/dashboard';
        } else {
          destination = '/homepage';
        }
      }
      await this.router.navigateByUrl(destination);
    } catch (error: any) {
      this.emailError = error.message || 'Unable to log in.';
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