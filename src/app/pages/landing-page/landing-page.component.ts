import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeroComponent} from "../../components/public/hero/hero.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeroComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
