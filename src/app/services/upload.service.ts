import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpEventType, HttpEvent, HttpParams} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { switchMap, tap, map, takeUntil, filter } from 'rxjs/operators';
import { AuthService } from "@auth0/auth0-angular";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  uploadFiles(
    formData: FormData,
    sendEmails: boolean,
    progressCallback?: (progress: number) => void,
    cancelToken?: Subject<void>
  ): Observable<string> {
    return this.addAuthHeader(true).pipe(
      switchMap(headers => {
        const params = new HttpParams().set('sendEmails', sendEmails.toString());
        return this.http.post<string>(`${this.apiUrl}/process-files`, formData, {
          headers,
          params,
          reportProgress: true,
          observe: 'events',
          responseType: 'text' as 'json'
        }).pipe(
          takeUntil(cancelToken || new Subject()),
          map(event => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                const progress = Math.round(100 * event.loaded / (event.total || 1));
                if (progressCallback) {
                  progressCallback(progress);
                }
                return null;
              case HttpEventType.Response:
                return event.body;
              default:
                return null;
            }
          }),
          // Filter out progress events
          filter(response => response !== null)
        );
      })
    );
  }

  checkProcessingStatus(taskId: string): Observable<string> {
    return this.addAuthHeader().pipe(
      switchMap(headers => {
        return this.http.get(`${this.apiUrl}/process-status/${taskId}`, {
          headers,
          responseType: 'text' // Expect text response
        });
      })
    );
  }

  downloadResult(taskId: string): Observable<Blob> {
    return this.addAuthHeader().pipe(
      switchMap(headers => {
        return this.http.get(`${this.apiUrl}/download-result/${taskId}`, {
          headers,
          responseType: 'blob'
        });
      })
    );
  }

  private addAuthHeader(isFormData: boolean = false): Observable<HttpHeaders> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        if (!isFormData) {
          headers = headers.set('Content-Type', 'application/json')
                         .set('Accept', 'application/json');
        }

        return [headers];
      })
    );
  }
}
