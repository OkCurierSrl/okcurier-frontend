import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from "../../environments/environment";
import {StateCodeProjection} from "../components/dashboard/create-order/order-form/state-code.projection";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCitySuggestions(input: string): Observable<any[]> {
    const url = this.baseUrl + `/api/place/autocomplete?input=${encodeURIComponent(input)}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getAddressSuggestions(input: string): Observable<any[]> {
    const url = this.baseUrl + `/api/place/autocomplete?input=${encodeURIComponent(input)}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getStreetNumberSuggestions(input: string, street: string, city: any): Observable<any[]> {
    const url = this.baseUrl + `/api/place/autocomplete?input=${encodeURIComponent(street)} ${encodeURIComponent(input)} ${encodeURIComponent(city)}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions));
  }

  getAddressDetails(placeId: string): Observable<any> {
    const url = this.baseUrl + `/api/place/details?placeid=${placeId}`;
    return this.http.get(url).pipe(map((res: any) => res.result));
  }

  validateCity(city: string): Observable<boolean> {
    const url = this.baseUrl + `/api/place/validate/city?city=${encodeURIComponent(city)}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions.length > 0));
  }

  validatePostalCode(postalCode: string, city: string): Observable<boolean> {
    const url = this.baseUrl + `/api/place/validate/postalcode?postalCode=${encodeURIComponent(postalCode)}&city=${encodeURIComponent(city)}`;
    return this.http.get(url).pipe(map((res: any) => res.predictions.length > 0));
  }

  getCities(county: string): Observable<any[]> {
    const url = `${this.baseUrl}/api/place/cities?countyCode=${encodeURIComponent(county)}`;
    return this.http.get<any[]>(url);
  }

  // Method to fetch all counties
  getCounties(): Observable<StateCodeProjection[]> {
    const url = `${this.baseUrl}/api/place/counties`;
    return this.http.get<StateCodeProjection[]>(url);
  }
}
