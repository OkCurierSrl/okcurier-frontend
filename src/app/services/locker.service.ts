import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Locker {
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

  constructor(private http: HttpClient) {}

  getLockersByCourier(courier: string): Observable<Locker[]> {
    return this.http.get<Locker[]>(`${this.apiUrl}/${courier}`);
  }

  getLockerById(lockerId: string): Observable<Locker> {
    return this.http.get<Locker>(`${this.apiUrl}/locker/${lockerId}`);
  }
}