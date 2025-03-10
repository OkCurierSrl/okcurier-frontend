import { Component, Inject } from '@angular/core';
import { faUser, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import {AsyncPipe, CommonModule, DOCUMENT, NgIf} from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import {Router, RouterLink, RouterModule} from '@angular/router';
import {ButtonModule} from "primeng/button";
import {MenubarModule} from "primeng/menubar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {environment} from "../../../../environments/environment";
import {RoleService} from "../../../services/role-service.service";
import {LanguageToggleComponent} from "../language-toggle/language-toggle.component";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdown,
    NgbCollapse,
    AsyncPipe,
    NgIf,
    RouterLink,
    CommonModule, RouterModule, MenubarModule, ButtonModule, LanguageToggleComponent
  ],
})
export class NavBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;
  isNavOpen: boolean = false;


  constructor(
    public auth: AuthService,
    private roleService: RoleService,
    @Inject(DOCUMENT) private doc: Document,
    private router: Router
  ) {
    this.auth.isAuthenticated$.subscribe((loggedIn) => {
      if (loggedIn) {
        // Subscribe to the Observable returned by hasRequiredRole to get the actual boolean value
        this.roleService.hasRequiredRole(['ADMIN']).subscribe((hasAdminRole) => {
          if (hasAdminRole) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  loginWithRedirect() {
    let redirectUri = environment.auth.authorizationParams.redirect_uri;
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

  toggleLanguage(en: string) {
    console.log('language ' + en);
  }
}
