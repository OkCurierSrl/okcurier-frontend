import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { PlacesService } from '../../../services/places.service';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { PriceCalculationService } from '../../../services/price-calculation.service';
import { Router } from "@angular/router";
import { OrderData } from "../../../model/order-data";
import { StateCodeProjection } from "../../../model/state-code.projection";

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
    NgIf,
    ReactiveFormsModule
  ],
  standalone: true
})
export class HeroComponent implements OnInit {
  selectedPackageType: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  prices: any[];
  counties: StateCodeProjection[];

  // Properties for auto-complete functionality
  expeditionCity: string = '';
  destinationCity: string = '';
  expeditionCitySuggestions: string[] = [];
  destinationCitySuggestions: string[] = [];

  constructor(
    private placesService: PlacesService,
    private http: HttpClient,
    private priceCalculationService: PriceCalculationService,
    private router: Router
  ) {
    this.selectedPackageType = 'plic';
  }

  ngOnInit(): void {
    this.loadCounties();
  }

  loadCounties(): void {
    this.placesService.getCounties().pipe(
      map((counties: StateCodeProjection[]) =>
        counties.map(county => {
          const transformedStateName = county.stateName.replace('County', '').trim();
          return {
            ...county,
            stateName: transformedStateName
          };
        })
      )
    ).subscribe((counties: StateCodeProjection[]) => {
      this.counties = counties;
    });
  }

  calculateTariff(): void {
    const orderData: OrderData = {
      lockerCourier: "", lockerId: "", useLocker: false,
      detinatorIban: '',
      iban: '',
      email: "",
      pickupDate: undefined,
      price: undefined,
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

    this.priceCalculationService.getPricesFree(orderData).subscribe(response => {
      console.log(response);
      // Use state instead of queryParams for consistency with other components
      this.router.navigate(['/courier-options'], {
        state: {
          couriers: response,
          orderData: orderData,
          origin: 'hero'
        }
      });
    });
  }

  onCitySearch(type: string): void {
    let searchTerm = type === 'expeditionCity' ? this.expeditionCity : this.destinationCity;
    if (searchTerm.length > 2) {  // Only search if input length is greater than 2
      this.placesService.getCitySuggestions(searchTerm).subscribe((cities: string[]) => {
        if (type === 'expeditionCity') {
          this.expeditionCitySuggestions = cities;
        } else {
          this.destinationCitySuggestions = cities;
        }
      });
    } else {
      // Reset suggestions if search term is less than 3 characters
      if (type === 'expeditionCity') {
        this.expeditionCitySuggestions = [];
      } else {
        this.destinationCitySuggestions = [];
      }
    }
  }

  selectCity(type: string, city: string): void {
    if (type === 'expeditionCity') {
      this.expeditionCity = city;
      this.expeditionCitySuggestions = []; // Clear suggestions after selection
    } else {
      this.destinationCity = city;
      this.destinationCitySuggestions = []; // Clear suggestions after selection
    }
  }

  hideSuggestions(type: string): void {
    setTimeout(() => {
      if (type === 'expeditionCity') {
        this.expeditionCitySuggestions = [];
      } else {
        this.destinationCitySuggestions = [];
      }
    }, 200); // Add a small delay to allow click selection

  }
}
