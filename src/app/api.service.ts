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
}
