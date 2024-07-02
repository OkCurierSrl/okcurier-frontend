import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiKey = 'AIzaSyCO77ldStnRCjfZ3EThONj8F8X6d3EVWvI';

  constructor(private http: HttpClient) {}

  getCitySuggestions(input: string): Observable<any[]> {
    const url = `/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&components=country:ro&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getAddressSuggestions(input: string): Observable<any[]> {
    const url = `/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:ro&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getStreetNumberSuggestions(input: string, street: string): Observable<any[]> {
    const url = `/api/place/autocomplete/json?input=${encodeURIComponent(street)} ${encodeURIComponent(input)}&types=address&components=country:ro&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getAddressDetails(placeId: string): Observable<any> {
    const url = `/api/place/details/json?placeid=${placeId}&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.result));
  }

  validateCity(city: string): Observable<boolean> {
    const url = `/api/place/autocomplete/json?input=${encodeURIComponent(city)}&types=(cities)&components=country:ro&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions.length > 0));
  }

  validatePostalCode(postalCode: string, city: string): Observable<boolean> {
    const url = `/api/place/autocomplete/json?input=${encodeURIComponent(postalCode)} ${encodeURIComponent(city)}&types=address&components=country:ro&key=${this.apiKey}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions.length > 0));
  }
}
