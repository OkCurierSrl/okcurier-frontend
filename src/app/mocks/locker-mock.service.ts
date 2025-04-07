import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
export class LockerMockService {
  private mockLockers: { [courier: string]: Locker[] } = {
    'DPD': [
      {
        id: 'DPD-001',
        name: 'DPD Locker Bucharest Center',
        address: 'Calea Victoriei 25, Bucharest',
        courier: 'DPD',
        coordinates: {
          lat: 44.4377401,
          lng: 26.0946235
        }
      },
      {
        id: 'DPD-002',
        name: 'DPD Locker Mall Vitan',
        address: 'Calea Vitan 55-59, Bucharest',
        courier: 'DPD',
        coordinates: {
          lat: 44.4197401,
          lng: 26.1246235
        }
      }
    ],
    'CARGUS': [
      {
        id: 'CARGUS-001',
        name: 'Cargus Locker Pipera',
        address: 'Bd. Dimitrie Pompeiu 6A, Bucharest',
        courier: 'CARGUS',
        coordinates: {
          lat: 44.4797401,
          lng: 26.1146235
        }
      },
      {
        id: 'CARGUS-002',
        name: 'Cargus Locker Militari',
        address: 'Bd. Iuliu Maniu 546-560, Bucharest',
        courier: 'CARGUS',
        coordinates: {
          lat: 44.4297401,
          lng: 26.0046235
        }
      }
    ],
    'SAMEDAY': [
      {
        id: 'SAMEDAY-001',
        name: 'Sameday Locker Unirii',
        address: 'Piața Unirii 1, Bucharest',
        courier: 'SAMEDAY',
        coordinates: {
          lat: 44.4277401,
          lng: 26.1046235
        }
      }
    ],
    'GLS': [
      {
        id: 'GLS-001',
        name: 'GLS Locker Baneasa',
        address: 'Șoseaua București-Ploiești 42D, Bucharest',
        courier: 'GLS',
        coordinates: {
          lat: 44.5077401,
          lng: 26.0746235
        }
      }
    ]
  };

  getLockersByCourier(courier: string): Observable<Locker[]> {
    return of(this.mockLockers[courier] || []);
  }

  getLockerById(lockerId: string): Observable<Locker | undefined> {
    for (const courier in this.mockLockers) {
      const locker = this.mockLockers[courier].find(l => l.id === lockerId);
      if (locker) {
        return of(locker);
      }
    }
    return of(undefined);
  }
}
