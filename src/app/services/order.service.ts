import { Injectable } from '@angular/core';
import {OrderData} from "../components/dashboard/create-order/order.data";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl =  environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateAwb(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/generateAwb', orderData);
  }

  orderCourier(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/orderCourier', orderData);
  }

  getOrders(): Observable<any[]> {
    // Replace with actual backend API call
    return this.http.get<any[]>(this.apiUrl + '/api/getOrders').pipe(
      map(data => {
        // Process data if necessary
        return data;
      })
    );
  }

}
