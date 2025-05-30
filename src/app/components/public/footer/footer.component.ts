import { Component } from '@angular/core';
import {PanelModule} from "primeng/panel";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [
    PanelModule,
    NgOptimizedImage
  ],
  standalone: true
})
export class FooterComponent {
}
