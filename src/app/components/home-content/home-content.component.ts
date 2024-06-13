import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import {CardModule} from "primeng/card";
import {TabViewModule} from "primeng/tabview";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {PanelModule} from "primeng/panel";

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TabViewModule, InputTextModule, DropdownModule, ButtonModule, PanelModule],
})
export class HomeContentComponent {
  faLink = faLink;
  locations = [
    { label: 'Cluj-Napoca', value: 'cluj' },
    { label: 'Bucuresti', value: 'bucuresti' }
  ];

  packageTypes = [
    { label: 'Plic', value: 'plic' },
    { label: 'Pachet mic', value: 'pachet-mic' },
    { label: 'Pachet mare', value: 'pachet-mare' }
  ];

  selectedLocation: any = null;
  selectedDestination: any = null;
  selectedPackageType: any = null;

  services = [
    { logo: 'assets/dpd.png', name: 'DPD', price: '10.10' },
    { logo: 'assets/posta-romana.png', name: 'Posta Romana', price: '10.99' },
    { logo: 'assets/cargus.png', name: 'Cargus', price: '10.99' },
    { logo: 'assets/fan.png', name: 'Fan', price: '12.25' },
    { logo: 'assets/sameday.png', name: 'Sameday', price: '14.29' },
    { logo: 'assets/gls.png', name: 'GLS', price: '14.99' }
  ];


}
