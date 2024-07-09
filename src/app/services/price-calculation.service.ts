import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

interface PriceCalculationResponse {
  courier;
  totalPrice;
}

@Injectable({
  providedIn: 'root'
})
export class PriceCalculationService {

  private apiUrl =  environment.apiUrl;

  constructor(private http: HttpClient) {}

  calculatePrice(request: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/calculate', request);
  }

  getPrices(orderData: any): Observable<PriceCalculationResponse> {
    return this.http.post<PriceCalculationResponse>(this.apiUrl + '/api/orders', orderData);
  }

}
