import { Component } from '@angular/core';
import {CardModule} from "primeng/card";
import {DropdownModule} from "primeng/dropdown";
import {TabViewModule} from "primeng/tabview";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ButtonDirective} from "primeng/button";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  imports: [
    CardModule,
    DropdownModule,
    TabViewModule,
    FormsModule,
    InputTextModule,
    ButtonDirective,
    NgForOf
  ],
  standalone: true
})
export class HeroComponent {
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
    { logo: 'assets/dpd.png', name: 'Cargus', price: '10.99' },
    { logo: 'assets/fan.png', name: 'Fan', price: '12.25' },
    { logo: 'assets/sameday.png', name: 'Sameday', price: '14.29' },
    { logo: 'assets/gls.png', name: 'GLS', price: '14.99' }
  ];

}
