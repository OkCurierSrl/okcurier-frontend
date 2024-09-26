import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import { environment } from "../../environments/environment";
import {StateCodeProjection} from "../model/state-code.projection";
import {TrackingResponse} from "../components/dashboard/show/show.component";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCitySuggestions(input: string): Observable<string[]> {
    const url = this.baseUrl + `/api/place/cities/search?input=${encodeURIComponent(input)}`;
    return this.http.get(url).pipe(
      map((res: any) => res.map((city: any) => city.formattedName)) // Extract 'name' property from each city object
    );
  }

  getAddressSuggestions(input: string, city: string): Observable<string[]> {
    const url = this.baseUrl + `/api/place/street?street=${encodeURIComponent(input)}&city=${encodeURIComponent(city)}`;
    return  this.http.get<string[]>(url);
  }
//
  getPostalCode(number: string, street: string, city: string): Observable<any> {//u
    const url = this.baseUrl + `/api/place/postal-code?number=${encodeURIComponent(number)}&street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}`;
    return this.http.get<any>(url);
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
