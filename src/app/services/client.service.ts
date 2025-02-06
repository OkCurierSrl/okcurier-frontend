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

  getClientByEmail(email: string): Observable<Client> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Client>(`${this.apiUrl}/api/client?email=` + email, {headers}))
    );
  }

  deleteClientByEmail(email: string): Observable<Client> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.delete<Client>(`${this.apiUrl}/api/client?email=` + email, {headers}))
    );
  }


  blockClientByEmail(email: string, block: boolean): Observable<Client> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Client>(`${this.apiUrl}/api/client/block?email=` + email + `&block=` + block, {headers}))
    );
  }

  getAllClients(): Observable<Client[]> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<Client[]>(`${this.apiUrl}/api/clients`, {headers}))
    );
  }

  modifyDiscounts(email: string, discounts: Discount): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/api/client/modify-discounts?email=${email}`,
      discounts,
      {responseType: 'text' as 'json'} // Specify responseType to handle plain text
    );
  }

  modifyBillingInfo(email: string, billingInfo: BillingInfo): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/api/client/modify-billingInfo?email=${email}`,
      billingInfo,
      {responseType: 'text' as 'json'} // Specify responseType to handle plain text
    );
  }


  inviteClient(newClientEmail: string, newClientContractNumber: string) {
    return this.http.get<void>(
      `${this.apiUrl}/api/client/send-invitation?email=${newClientEmail}&contractNumber=${newClientContractNumber}`,
      {responseType: 'text' as 'json'} // Specify responseType to handle plain text
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

  isProfileCompleted(): Observable<boolean> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<boolean>(`${this.apiUrl}/api/private/client/completed-profile`, {headers}))
    );
  }

  hasContract() {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<boolean>(`${this.apiUrl}/api/private/client/has-contract`, {headers}))
    );
  }
}
