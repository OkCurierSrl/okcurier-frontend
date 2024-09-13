// user.model.ts
import {AuthService} from "@auth0/auth0-angular";
// client.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Client} from "../model/client";
import {Discount} from "../model/discount";
import {BillingInfo} from "../model/billingInfo";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;  // Update with your API base URL

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  // Fetch all users from the backend
  getAllClients(): Observable<Client[]> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Client[]>(`${this.apiUrl}/api/test/get-users`, {headers}))
    );
  }
  modifyDiscounts(email: string, discounts: Discount[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/client/modify-discounts?email=${email}`,
      {discounts})
  }

  modifyBillingInfo(email: string, billingInfo: BillingInfo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/client/modify-billingInfo?email=${email}`,
      {billingInfo})
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

  getClientByEmail(email: string): Observable<Client> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Client>(`${this.apiUrl}/api/client?email=` + email, {headers}))
    );
  }
}
