import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../environments/environment';

export interface Locker {
  id: string;
  name: string;
  address: string;
  courier: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LockerService {
  private apiUrl = `${environment.apiUrl}/lockers`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getLockersByCourier(courier: string, useAuth: boolean = true): Observable<Locker[]> {
    if (useAuth) {
      return this.addAuthHeader().pipe(
        switchMap(headers => this.http.get<Locker[]>(`${this.apiUrl}/${courier}`, { headers }))
      );
    } else {
      return this.http.get<Locker[]>(`${this.apiUrl}/${courier}`);
    }
  }

  getLockerById(lockerId: string, useAuth: boolean = true): Observable<Locker> {
    if (useAuth) {
      return this.addAuthHeader().pipe(
        switchMap(headers => this.http.get<Locker>(`${this.apiUrl}/locker/${lockerId}`, { headers }))
      );
    } else {
      return this.http.get<Locker>(`${this.apiUrl}/locker/${lockerId}`);
    }
  }

  private addAuthHeader(): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return [headers];
      })
    );
  }
}