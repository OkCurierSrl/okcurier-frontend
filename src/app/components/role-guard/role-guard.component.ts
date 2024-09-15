// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {RoleService} from "../../services/role-service.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private roleService: RoleService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const expectedRoles: string[] = route.data.roles; // Get the roles required for the route

    console.log("expected rolse " + expectedRoles)
    return this.roleService.hasRequiredRole(expectedRoles).pipe(
      map(hasRole => {
        if (hasRole) {
          return true;
        } else {
          console.log("User does not have the required role", );
          this.router.navigate(['']); // Redirect if the user lacks the role
          return false;
        }
      }),
      catchError(err => {
        console.error('Role check failed', err);
        this.router.navigate(['']); // Redirect in case of error
        return of(false);
      })
    );
  }
}
