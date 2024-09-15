import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {OrderData} from "../components/dashboard/create-order/order.data";
import {CourierOption} from "../components/dashboard/courier-options/courier.option";
import {switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";

@Injectable({
  providedIn: 'root'
})
export class PriceCalculationService {
w
  private apiUrl =  environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getPrices(orderData: OrderData): Observable<CourierOption> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<CourierOption>(this.apiUrl + '/api/orders', orderData,{headers})
      ));
  }

  private addAuthHeader(): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        console.log('token = '  + token)
        return [headers];
      })
    );
  }
}
