import { Component } from '@angular/core';
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
  selectedPackageType: string = 'PLIC';
  weight: number;
  length: number;
  width: number;
  height: number;
  isPlic: boolean = true;
  prices: any[];
  packageTypes = ["PLIC", "COLET"]; // CAPS IMPORTANT TO BE THE SAME AS SPRING ENUMS

  services = [
    { logo: 'assets/dpd.png', name: 'DPD', price: '10.10' },
    { logo: 'assets/dpd.png', name: 'Cargus', price: '10.99' },
    { logo: 'assets/fan.png', name: 'Fan', price: '12.25' },
    { logo: 'assets/sameday.png', name: 'Sameday', price: '14.29' },
    { logo: 'assets/gls.png', name: 'GLS', price: '14.99' }
  ];

  constructor(private placesService: PlacesService, private http: HttpClient, private priceCalculation: PriceCalculationService) {}

  onCityInputChange(event: Event, field: 'location' | 'destination'): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.activeField = field;

    this.citySuggestions = this.placesService.getCitySuggestions(value).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(predictions => predictions.map(prediction => ({
        label: prediction.description,
        value: prediction.description
      })))
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

  onPackageTypeChange(event: any): void {
    this.isPlic = event.value === 'PLIC';
  }

  getPackageTypeOptions(): { label: string, value: string }[] {
    return this.packageTypes.map(type => ({ label: type, value: type }));
  }

  calculateTariff(): void {
    const request = {
      type: this.selectedPackageType,
      weight: this.weight,
      length: this.length,
      width: this.width,
      height: this.height
    };

    this.priceCalculation.calculatePrice(request).subscribe(data => {
      this.prices = data;
    });
  }
}
