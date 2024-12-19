import {Component, Renderer2} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/public/nav-bar/nav-bar.component';
import { FooterComponent } from './components/public/footer/footer.component';
import {ApiService} from "./api.service";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent],
})
export class AppComponent {
}
