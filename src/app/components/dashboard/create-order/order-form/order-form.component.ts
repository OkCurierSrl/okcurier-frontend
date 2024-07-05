import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PlacesService } from "../../../../services/places.service";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { NgForOf, NgIf } from "@angular/common";
import { ChipsModule } from "primeng/chips";
import { ButtonDirective } from "primeng/button";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    DropdownModule,
    NgIf,
    NgForOf,
    ChipsModule,
    ButtonDirective
  ],
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  @Input() title: string;
  @ViewChild('cityInput') cityInput: ElementRef;
  @ViewChild('streetInput') streetInput: ElementRef;
  @ViewChild('numberInput') numberInput: ElementRef;
  @ViewChild('postalCodeInput') postalCodeInput: ElementRef;

  orderForm: FormGroup;
  stateSuggestions: any[] = [
    { name: "Alba" },
    { name: "Bucuresi" },
    { name: "Napoca" },
    { name: "Timis" }
  ];
  citySuggestions: any[] = [];
  addressSuggestions: any[] = [];
  numberSuggestions: any[] = [];

  constructor(private fb: FormBuilder, private placesService: PlacesService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadStates();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      phone2: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      city: ['', Validators.required, this.cityValidator.bind(this)],
      state: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', [Validators.required]], // this.postalCodeValidator.bind(this)
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: ['']
    });
  }

  loadStates(): void {
    // Implement this method to load states from an API or a static list
  }

  onCityInput(event: any): void {
    const input = event.target.value;
    if (input) {
      this.placesService.getCitySuggestions(input).subscribe(suggestions => {
        this.citySuggestions = suggestions;
      });
    } else {
      this.citySuggestions = [];
    }
  }

  selectCity(city: string): void {
    this.orderForm.patchValue({ city: city.split(',')[0] });
    this.citySuggestions = [];
    this.streetInput.nativeElement.focus(); // Focus on street input
  }

  onAddressInput(event: any): void {
    const input = event.target.value;
    if (input) {
      this.placesService.getAddressSuggestions(input).subscribe(suggestions => {
        this.addressSuggestions = suggestions;
      });
    } else {
      this.addressSuggestions = [];
    }
  }

  selectAddress(address: any): void {
    this.orderForm.patchValue({ street: address.description.split(',')[0] });
    this.addressSuggestions = [];
    this.numberInput.nativeElement.focus(); // Focus on number input
  }

  onNumberInput(event: any): void {
    const input = event.target.value;
    const street = this.orderForm.get('street').value;
    if (input && street) {
      this.placesService.getStreetNumberSuggestions(input, street).subscribe(suggestions => {
        this.numberSuggestions = suggestions;
      });
    } else {
      this.numberSuggestions = [];
    }
  }

  selectNumber(number: any): void {
    this.placesService.getAddressDetails(number.place_id).subscribe(details => {
      const postalCode = details.address_components.find(ac => ac.types.includes('postal_code')).long_name;
      const state = details.address_components.find(ac => ac.types.includes('administrative_area_level_1')).long_name;
      this.orderForm.patchValue({
        number: number.description.split(',')[0],
        postalCode,
        state
      });
      this.postalCodeInput.nativeElement.focus(); // Focus on postal code input
    });
    this.numberSuggestions = [];
  }

  cityValidator(control: FormControl): Observable<any> {
    if (!this.orderForm) return of(null); // Ensure form is initialized
    return this.placesService.validateCity(control.value).pipe(
      map(isValid => (isValid ? null : { invalidCity: true })),
      catchError(() => of({ invalidCity: true }))
    );
  }

    // postalCodeValidator(control: FormControl): Observable<any> {
    //     console.log('Postal code validation started');
    //
    //     if (!this.orderForm) {
    //         console.log('Order form not initialized');
    //         return of(null);
    //     }
    //
    //     const cityControl = this.orderForm.get('city');
    //
    //     if (!cityControl) {
    //         console.log('City control not found');
    //         return of(null);
    //     }
    //
    //     console.log('City control found, validating the postal code');
    //
    //     return this.placesService.validatePostalCode(control.value, cityControl.value).pipe(
    //         map(isValid => {
    //             console.log('Postal code validation completed');
    //             return (isValid ? null : {invalidPostalCode: true})
    //         }),
    //         catchError(() => {
    //             console.log('Error occurred while validating postal code');
    //             return of({invalidPostalCode: true})
    //         })
    //     );
    // }

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log(`${this.title} Form submitted`, this.orderForm.value);
    } else {
      console.log(`${this.title} Form is invalid`);
    }
  }
}
