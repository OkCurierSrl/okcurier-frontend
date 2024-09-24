// role.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {environment} from "../../environments/environment";
import {JwtHelperService} from "@auth0/angular-jwt";

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

  private jwtHelper = new JwtHelperService();

  constructor(private auth: AuthService, private http: HttpClient) {}

  // hasRequiredRole(requiredRoles: string[]): Observable<boolean> {
  //   return this.auth.getAccessTokenSilently().pipe(
  //     switchMap((token) => {
  //       if (!token) {
  //         return of(false);
  //       }
  //       const decodedToken = this.jwtHelper.decodeToken(token);
  //       const roles = decodedToken['https://mynamespace.com/roles'] as string[] || [];
  //       return of(requiredRoles.some(role => roles.includes(role)));
  //     })
  //   );
  // }
}
