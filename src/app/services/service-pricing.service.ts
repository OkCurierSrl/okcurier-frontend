import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {AuthService} from "@auth0/auth0-angular";
import {switchMap} from "rxjs/operators";
import {ServicePricing} from "../model/service.pricing";

@Injectable({
  providedIn: 'root'
})
export class ServicePricingService {

  private apiUrl = `${environment.apiUrl}/api/service-pricing`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAllServicePricing(): Observable<ServicePricing[]> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<ServicePricing[]>(this.apiUrl, {headers}))
    );
  }

  saveServicePricing(servicePricing: ServicePricing): Observable<ServicePricing> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<ServicePricing>(this.apiUrl, servicePricing, {headers}))
    );
  }

  deleteServicePricing(id: number): Observable<void> {
    return this.auth.idTokenClaims$.pipe(
      switchMap(token => this.http.delete<void>(`${this.apiUrl}/${id}`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token.__raw}`
        }),
        withCredentials: true
      }))
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

}
