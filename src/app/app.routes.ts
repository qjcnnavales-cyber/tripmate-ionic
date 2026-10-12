import { Routes } from '@angular/router';

import { guestGuard } from './guest.guard';
import { adminGuard } from './admin.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path: 'homepage',
    loadComponent: () => import('./homepage/homepage.page').then( m => m.HomepagePage)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then( m => m.AboutPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage),
    canActivate: [adminGuard]
  },
  {
    path: 'host-dashboard',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'booking',
    loadComponent: () => import('./booking/booking.page').then( m => m.BookingPage)
  },
  {
    path: 'cancellation',
    loadComponent: () => import('./cancellation/cancellation.page').then( m => m.CancellationPage)
  },
  {
    path: 'contactus',
    loadComponent: () => import('./contactus/contactus.page').then( m => m.ContactusPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  { path: 'login', loadComponent: () => import('./login/login.page').then( m => m.LoginPage), canActivate: [guestGuard] },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'property',
    loadComponent: () => import('./property/property.page').then( m => m.PropertyPage)
  },
  { path: 'signup', loadComponent: () => import('./signup/signup.page').then( m => m.SignupPage), canActivate: [guestGuard] },
  {
    path: 'stays',
    loadComponent: () => import('./stays/stays.page').then( m => m.StaysPage)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./wishlist/wishlist.page').then( m => m.WishlistPage)
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./how-it-works/how-it-works.page').then( m => m.HowItWorksPage)
  },
  {
    path: 'become-host',
    loadComponent: () => import('./become-host/become-host.page').then( m => m.BecomeHostPage)
  },
  {
    path: 'developers',
    loadComponent: () => import('./developers/developers.page').then( m => m.DevelopersPage)
  },
  {
    path: 'itinerary',
    loadComponent: () => import('./itinerary/itinerary.page').then( m => m.ItineraryPage)
  },
  {
    path: 'budget-tracker',
    loadComponent: () => import('./budget-tracker/budget-tracker.page').then( m => m.BudgetTrackerPage)
  },
  {
    path: 'reservations',
    loadComponent: () => import('./reservations/reservations.page').then( m => m.ReservationsPage)
  },
  {
    path: 'company-history',
    loadComponent: () => import('./company-history/company-history.page').then( m => m.CompanyHistoryPage)
  },
  {
    path: 'about-company',
    loadComponent: () => import('./about-company/about-company.page').then( m => m.AboutCompanyPage)
  },
  {
    path: 'about-services',
    loadComponent: () => import('./about-services/about-services.page').then( m => m.AboutServicesPage)
  },
  {
    path: 'about-app',
    loadComponent: () => import('./about-app/about-app.page').then( m => m.AboutAppPage)
  },
  {
    path: 'terms-of-service',
    loadComponent: () => import('./terms-of-service/terms-of-service.page').then( m => m.TermsOfServicePage)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy.page').then( m => m.PrivacyPolicyPage)
  },
];





