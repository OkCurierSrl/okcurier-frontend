// role.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
export class RoleService {

  constructor(private auth: AuthService, private http: HttpClient) {}

  // Fetch user roles
  getUserRoles(): Observable<string[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const url = `http://localhost:8080/api/test/user-info`; // Replace with the appropriate URL
        return this.http.get<User>(url, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }),
      map((user: User) => user.roles.map(role => role.name)),
      catchError(err => {
        console.error('Error fetching roles', err);
        return []; // Return an empty array on error
      })
    );
  }

  // Check if user has the required roles
  hasRequiredRole(expectedRoles: string[]): Observable<boolean> {
    return this.getUserRoles().pipe(
      map(userRoles => expectedRoles.some(role => userRoles.includes(role)))
    );
  }
}
