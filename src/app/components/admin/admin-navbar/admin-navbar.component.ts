import {Component, Inject} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
    imports: [CommonModule, ButtonDirective, RouterLink],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }


}
