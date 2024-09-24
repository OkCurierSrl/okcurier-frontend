import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";
import {switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";
import {ProcessingStatus} from "./processing-status.service";

export class UploadService {
  private apiUrl = environment.apiUrl + '/api/process-files';

  constructor(private http: HttpClient,
              private auth: AuthService) {
  }

  uploadFiles(formData: FormData): Observable<string> {
    console.log('uploading files')
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.post<string>(this.apiUrl, formData, {headers}))
    );
  }

  checkProcessingStatus(taskId: string): Observable<ProcessingStatus> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get<ProcessingStatus>(`${this.apiUrl}/process-status/${taskId}`, {headers})));
  }

  downloadResult(taskId: string): Observable<Blob> {
    return this.addAuthHeader().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/download-result/${taskId}`, { headers, responseType: 'blob' })));
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
