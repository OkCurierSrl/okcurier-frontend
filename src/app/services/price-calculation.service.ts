import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {OrderData} from "../components/dashboard/create-order/order.data";
import {CourierOption} from "../components/dashboard/courier-options/courier.option";

@Injectable({
  providedIn: 'root'
})
export class PriceCalculationService {

  private apiUrl =  environment.apiUrl;

  constructor(private http: HttpClient) {}

  calculatePrice(request: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/calculate', request);
  }

  getPrices(orderData: OrderData): Observable<CourierOption> {
    return this.http.post<CourierOption>(this.apiUrl + '/api/orders', orderData);
  }

}
