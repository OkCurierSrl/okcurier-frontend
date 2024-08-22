import {Component, Inject} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";
import {environment} from "../../../../environments/environment";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { faUser, faPowerOff } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
    imports: [CommonModule, ButtonDirective, RouterLink, FontAwesomeModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: '../../dashboard/dashboard-navbar/dashboard-navbar.component.css'
})
export class AdminNavbarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;
  isNavOpen: boolean = false;
  showDropdown: boolean;

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

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
    console.log('nav open ' + this.isNavOpen);
  }


}
