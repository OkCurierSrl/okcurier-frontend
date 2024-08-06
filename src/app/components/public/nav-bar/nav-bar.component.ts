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
    CommonModule, RouterModule, MenubarModule, ButtonModule
  ],
})
export class NavBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;
  isNavOpen: boolean = false;

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private router: Router
  ) {
    this.auth.isAuthenticated$.subscribe((loggedIn, ) => {
      if (loggedIn) {
        this.router.navigate(['/dashboard/order']);
      }
    });

  }

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
    console.log('nav open ' + this.isNavOpen);
  }
}
