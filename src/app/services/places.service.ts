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
//
  getCities(county: string): Observable<any[]> {
    const url = `${this.baseUrl}/api/place/cities?countyName=${county}`;
    return this.http.get<any[]>(url);
  }

  // Method to fetch all counties
  getCounties(): Observable<StateCodeProjection[]> {
    const url = `${this.baseUrl}/api/place/counties`;
    return this.http.get<StateCodeProjection[]>(url);
  }

  getPostalCode(city, street, number): Observable<String> {
    const url = this.baseUrl + `/api/place/postal-code?city=${encodeURIComponent(city)}&street=${encodeURIComponent(street)}&number=${number}`;
    return this.http.get<String>(url);
  }
}
