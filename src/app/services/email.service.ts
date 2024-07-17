import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl =  environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendEmail(emailPayload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/email', emailPayload);
  }

}
