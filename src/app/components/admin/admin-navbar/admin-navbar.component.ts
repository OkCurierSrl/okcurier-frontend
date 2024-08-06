import {Component, Inject} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";
import {environment} from "../../../../environments/environment";

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
    let redirectUri = environment.auth.authorizationParams.redirect_uri;
    console.log(`Redirecting to ${redirectUri}`);
    this.auth.loginWithRedirect({
      authorizationParams: {
        redirect_uri: redirectUri
      }
    });
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }


}
