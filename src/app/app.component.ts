import {Component, Renderer2} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ApiService} from "./api.service";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
}
