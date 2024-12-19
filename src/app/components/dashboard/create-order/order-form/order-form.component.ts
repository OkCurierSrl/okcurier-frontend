import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardModule} from "primeng/card";
import {DropdownModule} from "primeng/dropdown";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ChipsModule} from "primeng/chips";
import {ButtonDirective} from "primeng/button";
import {PlacesService} from "../../../../services/places.service";
import {OrderService} from "../../../../services/order.service";
import {StateCodeProjection} from "../../../../model/state-code.projection";
import {map} from "rxjs/operators";
import {Address} from "../../../../model/address";
import {AuthService} from "@auth0/auth0-angular";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css'],
  standalone: true,
  imports: [
    DropdownModule,
    NgIf,
    NgForOf,
    ChipsModule,
    ButtonDirective,
    NgClass,
    CardModule,
    ReactiveFormsModule,
    AsyncPipe
  ]
})
export class OrderFormComponent implements OnInit, AfterViewInit {
  @Input() title: string;
  @Output() formValidityChange = new EventEmitter<boolean>();

  @ViewChild('streetInput') streetInput!: ElementRef;
  @ViewChild('numberInput') numberInput!: ElementRef;
  @ViewChild('postalCodeInput') postalCodeInput!: ElementRef;

  orderForm: FormGroup;
  favoriteAddressSuggestions: Address[] = [];
  favoriteAddressSuggestionsShortNames: string[] = [];
  counties: any[] = [];
  cities: any[] = [];
  isSavedAddress: boolean = false;

  private geocoder = new google.maps.Geocoder();
  private selectedStreet: string = '';

  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private placesService: PlacesService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCounties();
    this.loadFavoriteAddresses();
    const address: Address = {
      shortName: "Geani Dumitrache",
      name: "Geani Dumitrache",
      phone1: "0731446895",
      phone2: "",
      county: "B",
      locality: "Sector 3",
      street: "camil ressu",
      number: "35",
      postalCode: "0317415",
      block: "",
      staircase: "",
      floor: "",
      apartment: ""
    };
    this.selectFavoriteAddress(address);
  }

  ngAfterViewInit(): void {
    this.initStreetAutocomplete();
  }

  // Initialize Street Autocomplete
  private initStreetAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.streetInput.nativeElement, {
      types: ['address'],
      componentRestrictions: { country: 'RO' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.selectedStreet = this.extractComponent(place, 'route');
      this.streetInput.nativeElement.value = this.selectedStreet || 'Street not found';
    });
  }

  // On Street Number Input, fetch postal code
  onNumberInput(): void {
    const number = this.numberInput.nativeElement.value.trim();
    if (this.selectedStreet && number) {
      const fullAddress = `${this.selectedStreet} ${number}, Romania`;
      this.geocodeAddress(fullAddress);
    }
  }

  private geocodeAddress(address: string): void {
    this.geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const postalCode = this.extractComponent(results[0], 'postal_code');
        this.postalCodeInput.nativeElement.value = postalCode || 'Postal code not found';
        this.retriggerValidation();
      } else {
        console.warn('Geocoding failed:', status);
      }
    });
  }

  private retriggerValidation() {
    Object.keys(this.orderForm.controls).forEach(field => {
      console.log(field)
      const control = this.orderForm.get(field);
      control.markAsTouched({onlySelf: true});
      control.markAsDirty({onlySelf: true});
    });
    this.orderForm.updateValueAndValidity();
    console.log(this.orderForm.valid);
  }

// Extract a specific address component
  private extractComponent(place: any, type: string): string {
    const component = place.address_components?.find((c) => c.types.includes(type));
    return component?.long_name || '';
  }

  // Form Initialization
  private initForm(): void {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      phone2: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      county: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', Validators.required],
      email: [''],
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: [''],
      favoriteAddress: [''],
    });
  }

  // Load Counties
  private loadCounties(): void {
    this.placesService.getCounties()
      .pipe(map((counties) => counties.map((c) => ({ ...c, stateName: c.stateName.replace('County', '').trim() }))))
      .subscribe((counties) => (this.counties = counties));
  }

  // Load Favorite Addresses
  private loadFavoriteAddresses(): void {
    this.orderService.getAddresses().subscribe((addresses) => {
      this.favoriteAddressSuggestions = addresses;
      this.favoriteAddressSuggestionsShortNames = addresses.map((e) => e.shortName);
    });
  }

  // Handle County Change
  onCountyChange(event: any): void {
    const county = event.target.value;
    this.isSavedAddress = false;
    this.placesService.getCities(county).subscribe((data) => (this.cities = data));
  }

  // Handle Favorite Address Selection
  onFavoriteChange(event: Event): void {
    const elem = event.target as HTMLSelectElement
    const shortName = elem.value.split(': ').pop();  // This will get the part after ": "
    this.favoriteAddressSuggestions.forEach(favoriteAddressSuggestion => {
      if (favoriteAddressSuggestion.shortName == shortName) {
        this.selectFavoriteAddress(favoriteAddressSuggestion);
      }
    });
  }

  selectFavoriteAddress(suggestion: Address): void {
    this.isSavedAddress = true;
    this.orderForm.patchValue({
      email: "dumitrachegeanigabriel@gmail.com",
      name: suggestion.name,
      phone1: suggestion.phone1,
      phone2: suggestion.phone2 || '',
      county: suggestion.county, // Use the county name if it matches
      city: suggestion.locality, // Ensure this is correctly mapped
      street: suggestion.street || '', // Assuming street is a string
      streetInput: suggestion.street || '', // Assuming you want to show the street in the input field as well
      number: suggestion.number,
      postalCode: suggestion.postalCode,
      block: suggestion.block || '',
      staircase: suggestion.staircase || '',
      floor: suggestion.floor || '',
      apartment: suggestion.apartment || '',
    });

    this.retriggerValidation()
  }

  get formGroup(): FormGroup {
    return this.orderForm;
  }

}
