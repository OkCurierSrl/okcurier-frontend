import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { PlacesService } from '../../../services/places.service';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { PriceCalculationService } from '../../../services/price-calculation.service';
import {Router} from "@angular/router";
import {OrderData} from "../../dashboard/create-order/order.data";

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
    NgForOf,
    AsyncPipe,
    NgIf
  ],
  standalone: true
})
export class HeroComponent {
  citySuggestions: Observable<{ label: string, value: string }[]>;
  activeField: 'location' | 'destination' | null = null;
  selectedLocation: string;
  selectedDestination: string;
  selectedPackageType: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  prices: any[];

  constructor(private placesService: PlacesService, private http: HttpClient, private priceCalculationService: PriceCalculationService, private router: Router) {
    this.selectedPackageType = 'plic';
  }



  onCityInputChange(event: Event, field: 'location' | 'destination'): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.activeField = field;

    this.citySuggestions = this.placesService.getCitySuggestions(value).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(predictions => predictions.map(prediction => {
        let label = prediction.description.split(',')[0].trim();
        return ({
          label: label,
          value: label
        });
      }))
    );
  }

  selectSuggestion(suggestion: { label: string, value: string }): void {
    if (this.activeField === 'location') {
      this.selectedLocation = suggestion.value;
    } else if (this.activeField === 'destination') {
      this.selectedDestination = suggestion.value;
    }
    this.activeField = null;
  }

  calculateTariff(): void {
    const orderData: OrderData = {
      destinatar: undefined,
      expeditor: undefined,
      extraServices: {},
      isPlicSelected: this.selectedPackageType == 'plic',
      packages: [{
        length: this.length,
        width: this.width,
        height: this.height,
        weight: this.weight
      }]
    };

    console.log(orderData);
    this.priceCalculationService.getPrices(orderData).subscribe(
      response => {
        console.log(response);
        this.router.navigate(['/courier-options'],
          { queryParams: {
            couriers: JSON.stringify(response),
              orderData: JSON.stringify(orderData)
          }});
    });
  }
}
