import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import config from '../../auth_config.json';
import {switchMap} from "rxjs/operators";
import {AuthService} from "@auth0/auth0-angular";

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  ping$() {
    return this.http.get(`${config.apiUri}/api/external`);
  }

  getHello() {
    return this.auth.idTokenClaims$.pipe(
      switchMap(token => this.http.get('http://localhost:8080/hello', {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token.__raw}`}),
        withCredentials: true
      }))
    );
  }
}
