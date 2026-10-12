import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastCtrl = inject(ToastController);

  return authService.currentUser$.pipe(
    filter(user => user !== 'loading'),
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }

      toastCtrl.create({
        message: 'Access denied. Admin only.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      }).then(toast => toast.present());

      return router.createUrlTree(['/homepage']);
    })
  );
};
