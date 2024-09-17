import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, share, switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";
import {OrderData} from "../model/order-data";
import {Address} from "../model/address";
import {Shipment} from "../model/shipment";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  trackOrder(awbNumber: string): Observable<any> {
    let url = this.apiUrl + '/api/okcurier/track-order?awb=' + awbNumber;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<any>(url, { headers }))
    );
  }

  getAllOrders(): Observable<Shipment[]> {
    let url = this.apiUrl + '/api/okcurier/orders';
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Shipment[]>(url, { headers }))
    );
  }

  placeOrder(data: OrderData, courier: string): Observable<any> {
    let url = this.apiUrl + '/api/okcurier/place-order?courierCompany=' + courier;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<any>(url, data, { headers }))
    );
  }

  pickupOrder(data: OrderData, courier: string): Observable<any> {
    let url = this.apiUrl + '/api/okcurier/pickup-order?courierCompany=' + courier;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<any>(url, data, { headers }))
    );
  }

  awbExists(awb: string): Observable<any> {
    // Check that apiUrl ends with a slash and the path starts correctly
    let url = `${this.apiUrl}/api/okcurier/awb-exists?awb=${awb}`;
    console.log(url)
    return this.http.get<any>(url).pipe(
      map(data => {
        return data;
      })
    );
  }

  private addAuthHeader(): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return [headers];
      })
    );
  }

  saveAddress(data: any): Observable<any> {
    const url = `${this.apiUrl}/api/address/save`;

    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<any>(url, data, { headers }))
    );
  }

  getAddresses(): Observable<Address[]> {
    const url = `${this.apiUrl}/api/addresses`;

    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Address[]>(url, { headers }))
    );
  }


  deleteAddress(shortName: string): Observable<any> {
    let url = this.apiUrl + '/api/address/' + shortName;
    return this.http.delete<void>(url)
  }
}
