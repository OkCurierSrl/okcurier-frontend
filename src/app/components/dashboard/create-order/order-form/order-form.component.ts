declare const google: any;

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
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
import {environment} from "../../../../../environments/environment";
import {Subscription} from "rxjs";

interface County {
  stateName: string;
  stateCode: string;
}

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
export class OrderFormComponent implements OnInit {
  @Input() title: string;
  @Output() formValidityChange = new EventEmitter<boolean>();

  @ViewChild('streetInput') streetInput!: ElementRef;
  @ViewChild('numberInput') numberInput!: ElementRef;
  @ViewChild('postalCodeInput') postalCodeInput!: ElementRef;

  orderForm: FormGroup;
  favoriteAddressSuggestions: Address[] = [];
  favoriteAddressSuggestionsShortNames: string[] = [];
  counties: County[] = [];
  cities: any[] = [];
  isSavedAddress: boolean = false;
  private autocomplete: google.maps.places.Autocomplete | null = null;

  private geocoder = new google.maps.Geocoder();
  private selectedStreet: string = '';
  private userSubscription: Subscription;
  user: any | null = null; // Holds the authenticated user object or null

  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private placesService: PlacesService,
    private orderService: OrderService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCounties();
    this.loadFavoriteAddresses();
    this.userSubscription = this.auth.user$.subscribe(user => {
      this.user = user; // Safely update the user property
    });

    // Listen for county changes -> load cities
    this.orderForm.get('county')?.valueChanges.subscribe((county) => {
      this.isSavedAddress = false;
      this.placesService.getCities(county).subscribe((data) => {
        this.cities = data;
        this.initStreetAutocomplete(county, this.cities[0])
        return true;
      });
    });

    // Listen for city changes -> update street autocomplete bounds
    this.orderForm.get('city')?.valueChanges.subscribe(() => {
      this.updateAutocompleteBounds();
    });


    // const address: Address = {
    //   shortName: "Geani Dumitrache",
    //   name: "Geani Dumitrache",
    //   phone1: "0731446895",
    //   phone2: "",
    //   county: "Bucuresti",
    //   city: "Sector 3",
    //   street: "camil ressu",
    //   number: "35",
    //   postalCode: "0317415",
    //   block: "",
    //   staircase: "",
    //   floor: "",
    //   apartment: ""
    // };
    // this.selectFavoriteAddress(address);
  }


  private updateAutocompleteBounds(): void {
    if (!this.autocomplete) return; // if not yet initialized

    const city = this.orderForm.get('city')?.value;
    const county = this.orderForm.get('county')?.value;

    // Only proceed if both city & county are available
    if (!city || !county) {
      // Optionally clear bounds if city/county are missing
      this.autocomplete.setBounds(undefined);
      this.autocomplete.setOptions({ strictBounds: false });
      return;
    }

    // Geocode "City, County, Romania"
    const address = `${city}, ${county}, Romania`;
    this.geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        // Get the bounding box (viewport)
        const viewport = results[0].geometry.viewport;
        if (viewport && this.autocomplete) {
          this.autocomplete.setBounds(viewport);
          // Setting strictBounds = true means user must pick from that bounding area
          this.autocomplete.setOptions({ strictBounds: true });
        }
      } else {
        console.warn(`Could not geocode city '${address}':`, status);
      }
    });
  }

  // Initialize Street Autocomplete
  private initStreetAutocomplete(city: string, county: string): void {
    // Read the current city & county from the form
    // console.log("Initializing street autocomplete for")
    // console.log("city", city)
    // console.log("county", county)


    // Initialize the autocomplete restricted to country=RO
    this.autocomplete = new google.maps.places.Autocomplete(this.streetInput.nativeElement, {
      types: ['address'],
      componentRestrictions: { country: 'RO' },
    });

    // If city and county are set, geocode them to get a bounding box
    if (city && county) {
      const address = `${city}, ${county}, Romania`;
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const viewport = results[0].geometry.viewport;
          if (viewport && this.autocomplete) {
            // Restrict the autocomplete to the bounding box
            this.autocomplete.setBounds(viewport);
            // strictBounds = true means it won't suggest addresses outside that area
            this.autocomplete.setOptions({ strictBounds: true });
          }
        } else {
          console.warn(`Could not geocode city '${address}':`, status);
        }
      });
    }

    // Listen for the place_changed event
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      this.selectedStreet = this.extractComponent(place, 'route');
      this.streetInput.nativeElement.value = this.selectedStreet || 'Street not found';

      this.orderForm.get('street')?.setValue(this.selectedStreet);
    });

    this.triggerValidation()
  }

  // On Street Number Input, fetch postal code
  onNumberInput(): void {
    const number = this.numberInput.nativeElement.value.trim();

    // Also fetch the city and county from the form
    const city = this.orderForm.get('city')?.value;
    const county = this.orderForm.get('county')?.value;

    console.log(city, county);
    if (this.selectedStreet && number && city && county) {
      // Be sure to include city and county in the geocode query
      const fullAddress = `${this.selectedStreet} ${number}, ${city}, ${county}, Romania`;
      this.geocodeAddress(fullAddress, county, this.selectedStreet, number);
    }

    this.triggerValidation()
  }


  private geocodeAddress(
    address: string,
    city: string,
    street: string,
    number: string
  ): void {
    // Attempt the fallback first
    this.placesService.getPostalCode(city, street, number)
      .subscribe({
        next: (fallbackPostalCode: string) => {
          if (fallbackPostalCode) {
            this.updatePostalCode(fallbackPostalCode);
          } else {
            // The fallback returned no postal code, use Google as a secondary attempt
            this.geocodeWithGoogle(address);
          }
        },
        error: (err) => {
          // The fallback lookup failed, so we fallback to Google’s geocoding
          console.error('Fallback postal code lookup failed:', err);
          this.geocodeWithGoogle(address);
        }
      });
  }

  private updatePostalCode(fallbackPostalCode: string) {
    // We found a postal code via the fallback
    this.postalCodeInput.nativeElement.value = fallbackPostalCode;
    this.orderForm.get('postalCode')?.setValue(fallbackPostalCode, {emitEvent: true});
    this.triggerValidation();
  }

  /**
   * Uses Google Maps Geocoding API to find a postal code and sets the value if found
   */
  private geocodeWithGoogle(address: string): void {
    // Make sure you have ‘this.geocoder’ properly instantiated
    this.geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const postalCode = this.extractComponent(results[0], 'postal_code');
        if (postalCode) {
          this.updatePostalCode(postalCode)
        } else {
          this.updatePostalCode('Postal code not found');
        }
      } else {
        console.warn('Geocoding failed:', status);
        this.postalCodeInput.nativeElement.value = 'Postal code not found';
      }
      // Always re-trigger validation
      this.triggerValidation();
    });
  }






  private triggerValidation() {
    Object.keys(this.orderForm.controls).forEach(field => {
      const control = this.orderForm.get(field);
      control.markAsTouched({onlySelf: true});
      control.markAsDirty({onlySelf: true});
    });
    this.orderForm.updateValueAndValidity();
  }

// Extract a specific address component
  private extractComponent(place: any, type: string): string {
    const component = place.address_components?.find((c) => c.types.includes(type));
    return component?.long_name || '';
  }

  // Form Initialization
  private initForm(): void {

    let required
    if (!this.user)
      required = Validators.required;
    else
      required = '';


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
      email: undefined,
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

    this.triggerValidation()
  }

  get formGroup(): FormGroup {
    return this.orderForm;
  }

  setLockerDelivery(selectedLockerId: string) {
    console.log('Selected Locker ID:', selectedLockerId);
  }
}
