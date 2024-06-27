import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PriceCalculationService {

  private apiUrl =  environment.apiUrl + '/api/calculate';

  constructor(private http: HttpClient) {}

  calculatePrice(request: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }
}
