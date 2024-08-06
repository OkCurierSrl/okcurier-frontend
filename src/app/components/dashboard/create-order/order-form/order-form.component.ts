import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardModule} from "primeng/card";
import {DropdownModule} from "primeng/dropdown";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ChipsModule} from "primeng/chips";
import {ButtonDirective} from "primeng/button";
import {PlacesService} from "../../../../services/places.service";
import {Address} from "../order.data";
import {OrderService} from "../../../../services/order.service";
import {StateCodeProjection} from "./state-code.projection";
import {map} from "rxjs/operators";


/**
 * Represents the Order Form Component.
 * @class
 */
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  standalone: true,
  imports: [
    DropdownModule,
    NgIf,
    NgForOf,
    ChipsModule,
    ButtonDirective,
    NgClass,
    CardModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./order-form.component.css']
})

export class OrderFormComponent implements OnInit {
  @Input() title: string;
  @Output() formValidityChange = new EventEmitter<boolean>();
  @ViewChild('cityInput') cityInput: ElementRef;
  @ViewChild('streetInput') streetInput: ElementRef;
  @ViewChild('numberInput') numberInput: ElementRef;
  @ViewChild('postalCodeInput') postalCodeInput: ElementRef;

  orderForm: FormGroup;
  addressSuggestions: any[] = [];
  numberSuggestions: any[] = [];
  counties: any[] = [];
  cities: any[] = [];
  favoriteAddressSuggestions: Address[] = [];
  favoriteAddressSuggestionsShortNames: String[] = [];
  protected isSavedAddress: boolean = false;


  constructor(private fb: FormBuilder, private placesService: PlacesService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCounties();
    this.loadFavoriteAddresses();
    this.orderForm.statusChanges.subscribe(status => {
      this.formValidityChange.emit(this.orderForm.valid);
    });

    // Watch the streetInput field and validate it
    this.orderForm.get('streetInput').valueChanges.subscribe(value => {
      let suggestionValid = this.isSuggestionValid(value);
      console.log('Suggestion valid: ', suggestionValid);
      if (value && !suggestionValid) {
        this.orderForm.get('street').setValue('');
        this.orderForm.get('street').setErrors({ invalid: true });
      } else if (value) {
        this.orderForm.get('street').setErrors(null);
      }
    });
  }

  loadFavoriteAddresses(): void {
    this.orderService.getAddresses().subscribe(addresses => {
      this.favoriteAddressSuggestions = addresses;
      this.favoriteAddressSuggestionsShortNames = addresses.map(e => e.shortName);
    });
  }


  initForm(): void {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      phone2: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      county: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      streetInput: ['', Validators.required], // Input field for user typing
      number: ['', Validators.required],
      postalCode: ['', [Validators.required]],
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: [''],
      favoriteAddress: [''] // Add a control for favorite address
    });
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

  onCountyChange(event: any): void {
    this.isSavedAddress = false;
    const aux = event.target as HTMLSelectElement;
    const county = aux.value
    console.log('Judetul s-a schimbat in ' + county);
    this.placesService.getCities(county).subscribe(data => {
      this.cities = data;
      console.log(this.cities)
    }, error => {
      console.error('Error loading cities: ', error);
    });
  }

  onAddressInput(event: any): void {
    const input = event.target.value;
    if (input) {
      this.placesService.getAddressSuggestions(input).subscribe(suggestions => {
        this.addressSuggestions = suggestions.map(suggestion => ({
          description: this.extractStreetName(suggestion.description),
          rawDescription: suggestion.description
        }));
      });
    } else {
      this.addressSuggestions = [];
    }
  }


  selectAddress(suggestion: any, streetInputField: HTMLInputElement) {
    this.orderForm.patchValue({
      street: suggestion.description, // Hidden field for validated street
      streetInput: suggestion.description // Displayed input field
    });
    streetInputField.value = suggestion.description;
    this.addressSuggestions = [];
  }

  isSuggestionValid(input: string): boolean {
    console.log('value : ', input);
    console.log('suggestions : ', this.addressSuggestions);
    return this.addressSuggestions.some(suggestion => suggestion.description === input) || this.isSavedAddress;
  }

  extractStreetName(description: string): string {
    // Extract the street name from the full description
    const parts = description.split(',');
    return parts[0] || description;
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

  onFavoriteChange(event: Event): void {
    const elem = event.target as HTMLSelectElement
    const shortName = elem.value.split(': ').pop();  // This will get the part after ": "
    console.log(shortName);
    console.log(this.favoriteAddressSuggestions);
    this.favoriteAddressSuggestions.forEach(favoriteAddressSuggestion => {
      if (favoriteAddressSuggestion.shortName == shortName) {
        this.selectFavoriteAddress(favoriteAddressSuggestion);
      }
    });
  }

  selectFavoriteAddress(suggestion: Address): void {
    this.isSavedAddress = true;
    this.orderForm.patchValue({
      name: suggestion.name,
      phone1: suggestion.phone1,
      phone2: suggestion.phone2 || '',
      county: suggestion.county, // Use the county name if it matches
      city: suggestion.city, // Ensure this is correctly mapped
      street: suggestion.street || '', // Assuming street is a string
      streetInput: suggestion.street || '', // Assuming you want to show the street in the input field as well
      number: suggestion.number,
      postalCode: suggestion.postalCode,
      block: suggestion.block || '',
      staircase: suggestion.staircase || '',
      floor: suggestion.floor || '',
      apartment: suggestion.apartment || '',
    });

    // Mark all controls as touched and dirty
    Object.keys(this.orderForm.controls).forEach(field => {
      const control = this.orderForm.get(field);
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
    });

    // Trigger re-validation
    this.orderForm.updateValueAndValidity();
  }
}
