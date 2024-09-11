import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface User {
  email: string;
  name: string;
  picture: string;
  roles: UserRole[];
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRoles: string[] = route.data.roles; // Get the roles required for the route
    const userId = 'user_id_placeholder'; // Replace with the logic to retrieve the current user's ID

    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const url = `https://okcurier-staging.eu.auth0.com/api/v2/users/${userId}/roles`;
        return this.http.get<User>(`http://localhost:8080/api/test/user-info`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }),
      map((user: User) => {
        const userRoles = user.roles.map(role => role.name);
        const hasRole = expectedRoles.some(role => userRoles.includes(role));

        console.log(userRoles)
        console.log(hasRole)

        if (hasRole) {
          return true;
        } else {
          console.log("nu are rol bun")
          this.router.navigate(['']); // Redirect to an  page if the user lacks the role
          return false;
        }
      }),
      catchError((err) => {
        console.error('Role check failed', err);
        console.log("nu are rol bun")
        this.router.navigate(['']); // Redirect to an unauthorized page in case of error
        return of(false);
      })
    );
  }
}
