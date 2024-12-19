import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";
import {OrderData} from "../model/order-data";
import {Address} from "../model/address";
import {FlatShipment} from "../model/flatShipment";
import {TrackingResponse} from "../components/dashboard/show/show.component";
import {PickupData} from "./pickupData";
import {ApiDownloadResponse} from "../components/dashboard/courier-options/api-download.response";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  trackOrder(awbNumber: string): Observable<TrackingResponse> {
    let url = this.apiUrl + '/api/okcurier/track-order?awb=' + awbNumber;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<TrackingResponse>(url, { headers }))
    );
  }

  filterShipments(filters: any, page: number, size: number): Observable<any> {
    let params = new HttpParams();

    // Convert each filter property to query parameters
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    params = params.set('page', page.toString()).set('size', size.toString());

    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<any>(`${this.apiUrl}/api/okcurier/orders/filter`, { headers, params }))
    );
  }

  filterShipmentsRechecked(filters: any, page: number, size: number): Observable<any> {
    let params = new HttpParams();

    // Convert each filter property to query parameters
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    params = params.set('page', page.toString()).set('size', size.toString());

    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<any>(`${this.apiUrl}/api/okcurier/orders/filter/rechecked`, { headers, params }))
    );
  }


  placeOrder(orderData : OrderData, courier: string, pickup: boolean): Observable<ApiDownloadResponse> {
    let url = this.apiUrl + '/api/okcurier/place-order?courierCompany=' + courier + '&alsoPickup=' + pickup;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<ApiDownloadResponse>(url, orderData, { headers }))
    );
  }

  placeOrderFree(orderData: OrderData, courier: string): Observable<ApiDownloadResponse> {
    let url = this.apiUrl + '/api/okcurier/place-order-free?courierCompany=' + courier;
    return this.http.post<ApiDownloadResponse>(url, orderData, {headers: this.addDefaultHeaders()});
  }

  downloadLabel(awb: string) {
    let url = this.apiUrl + '/api/okcurier/download-label?awb=' + awb;
    return this.http.get<ApiDownloadResponse>(url);
  }



  pickupOrder(data: PickupData, courier: string, orderId: number): Observable<any> {
    let url = this.apiUrl + '/api/okcurier/pickup-order?courierCompany=' + courier + '&id=' + orderId;
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<any>(url, data, { headers }))
    );
  }

  awbExists(awb: string): Observable<any> {
    // Check that apiUrl ends with a slash and the path starts correctly
    let url = `${this.apiUrl}/api/okcurier/awb-exists?awb=${awb}`;
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


  private addDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
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
