import { Component } from '@angular/core';
import {PanelModule} from "primeng/panel";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [
    PanelModule
  ],
  standalone: true
})
export class FooterComponent {
}
