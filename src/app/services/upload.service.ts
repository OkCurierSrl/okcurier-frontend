import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {switchMap} from "rxjs/operators";
import {TrackingResponse} from "../components/dashboard/show/show.component";
import {AuthService} from "@auth0/auth0-angular";

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl + '/api/process-files';

  constructor(private http: HttpClient,
              private auth: AuthService) {
  }

  uploadFiles(formData: FormData): Observable<any> {
    console.log('uploading files')
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post(this.apiUrl, formData, {headers, responseType: 'blob'}))
    );
  }

  private addAuthHeader(): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        });
        return [headers];
      })
    );
  }
}
