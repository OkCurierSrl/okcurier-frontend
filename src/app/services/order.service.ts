import {Injectable} from '@angular/core';
import {Address, OrderData} from "../components/dashboard/create-order/order.data";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map, share} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  generateAwb(orderData: OrderData, courier: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/order+ courier', orderData);
  }

  orderCourier(orderData: OrderData, courier: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/okcurier/place-order?courierCompany=' + courier, orderData);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/api/getOrders').pipe(
      map(data => {
        // Process data if necessary
        return data;
      })
    );
  }

  saveAddress(data: any): Observable<any> {
    let url = this.apiUrl + '/api/address/save';
    return this.http.post<any>(url, data)
  }

  getAddresses() {
    let url = this.apiUrl + '/api/addresses';
    return this.http.get<Address[]>(url)
  }

  deleteAddress(shortName: string): Observable<any> {
    let url = this.apiUrl + '/api/address/' + shortName;
    return this.http.delete<void>(url)
  }
}
