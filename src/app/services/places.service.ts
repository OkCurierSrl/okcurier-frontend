import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = '/api/place/autocomplete/json';

  constructor(private http: HttpClient) {}

  getCitySuggestions(input: string): Observable<any[]> {
    const params = new HttpParams()
      .set('input', input)
      .set('types', '(cities)')
      .set('key', 'AIzaSyCO77ldStnRCjfZ3EThONj8F8X6d3EVWvI');

    return this.http.get<{ predictions: any[] }>(this.apiUrl, { params }).pipe(
      map(response => response.predictions)
    );
  }
}
