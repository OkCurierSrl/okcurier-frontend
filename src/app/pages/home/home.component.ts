import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HeroComponent } from '../../components/public/hero/hero.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    HeroComponent,
    LoadingComponent,
    AsyncPipe,
    NgIf
  ]
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}
