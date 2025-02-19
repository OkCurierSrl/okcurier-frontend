import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";
import {ProcessingStatus} from "./processing-status.service";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient,
              private auth: AuthService) {
  }

  uploadFiles(formData: FormData, sendEmails: boolean): Observable<string> {
    console.log('uploading files')
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<string>(`${this.apiUrl}/process-files/${sendEmails}`, formData, {headers}))
    );
  }

  checkProcessingStatus(taskId: string): Observable<string> {
    console.log("checking status");
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<string>(`${this.apiUrl}/process-status/${taskId}`, {
        headers,
        responseType: 'text' as 'json'
      }))
    );
  }

  downloadResult(taskId: string): Observable<Blob> {
    console.log("downloading result")
    return this.addAuthHeaderBlob().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/download-result/${taskId}`, { headers, responseType: 'blob' })));
  }


  private addAuthHeaderBlob(): Observable<HttpHeaders> {
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
  private addAuthHeader(): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
        });
        return [headers];
      })
    );
  }
}
