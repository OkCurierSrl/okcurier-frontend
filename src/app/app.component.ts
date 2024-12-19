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
  title = 'Auth0 Angular SDK Sample';
  private message: string;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  loadGoogleMaps(): void {
    const script = this.renderer.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    this.renderer.appendChild(document.body, script);

    script.onload = () => {
      console.log('Google Maps API loaded successfully!');
      // Initialize Google Maps logic here if needed
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API.');
    };
  }
}
