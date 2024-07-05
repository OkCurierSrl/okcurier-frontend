import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { ChipsModule } from "primeng/chips";
import { ButtonDirective } from "primeng/button";
import { PlacesService } from "../../../../services/places.service";

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
    ButtonDirective,
    NgClass
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
    { name: "Bucuresti" },
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
      city: ['', Validators.required],
      state: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', [Validators.required]],
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

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log(`${this.title} Form submitted`, this.orderForm.value);
    } else {
      console.log(`${this.title} Form is invalid`);
      this.markFormGroupTouched(this.orderForm);
      this.logFormErrors(this.orderForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  logFormErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormControl && control.invalid) {
        console.log(`Field ${key} is invalid:`, control.errors);
      } else if (control instanceof FormGroup) {
        this.logFormErrors(control);
      }
    });
  }
}
