import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrackRedirectGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const awb = route.params['awb'];

    return this.auth.isAuthenticated$.pipe(
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          return new Observable<boolean>(observer => {
            observer.next(true);
            observer.complete();
          });
        }

        return this.auth.user$.pipe(
          map(user => {
            const roles = user?.['https://mynamespace.com/roles'] || [];
            if (roles.includes('ADMIN')) {
              this.router.navigate(['/admin/track', awb]);
              return false;
            } else {
              this.router.navigate(['/dashboard/track', awb]);
              return false;
            }
          })
        );
      }),
      take(1)
    );
  }
}