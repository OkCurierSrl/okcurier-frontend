import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from "primeng/card";
import {DropdownChangeEvent, DropdownModule} from "primeng/dropdown";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { ChipsModule } from "primeng/chips";
import { ButtonDirective } from "primeng/button";
import { PlacesService } from "../../../../services/places.service";

/**
 * Represents the Order Form Component.
 * @class
 */
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

  constructor(private fb: FormBuilder, private placesService: PlacesService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCounties();
    this.orderForm.statusChanges.subscribe(status => {
      this.formValidityChange.emit(this.orderForm.valid);
      this.logFormValidity();

    });
  }

  // todo delete
  logFormValidity(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      console.log(`${key} valid:`, control.valid);
    });
    console.log(`Form valid: ${this.orderForm.valid}`);
  }


  initForm(): void {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      phone2: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      county: ['', Validators.required],
      city: [''],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', [Validators.required]],
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: ['']
    });
  }

  loadCounties(): void {
    this.counties = [
      { name: "Alba" },
      { name: "Arad" },
      { name: "Argeș" },
      { name: "Bacău" },
      { name: "Bihor" },
      { name: "Bistrița-Năsăud" },
      { name: "Botoșani" },
      { name: "Brașov" },
      { name: "Brăila" },
      { name: "Buzău" },
      { name: "Caraș-Severin" },
      { name: "Călărași" },
      { name: "Cluj" },
      { name: "Constanța" },
      { name: "Covasna" },
      { name: "Dâmbovița" },
      { name: "Dolj" },
      { name: "Galați" },
      { name: "Giurgiu" },
      { name: "Gorj" },
      { name: "Harghita" },
      { name: "Hunedoara" },
      { name: "Ialomița" },
      { name: "Iași" },
      { name: "Ilfov" },
      { name: "Maramureș" },
      { name: "Mehedinți" },
      { name: "Mureș" },
      { name: "Neamț" },
      { name: "Olt" },
      { name: "Prahova" },
      { name: "Satu Mare" },
      { name: "Sălaj" },
      { name: "Sibiu" },
      { name: "Suceava" },
      { name: "Teleorman" },
      { name: "Timiș" },
      { name: "Tulcea" },
      { name: "Vaslui" },
      { name: "Vâlcea" },
      { name: "Vrancea" },
      { name: "București" }
    ];
  }

  onCountyChange(event: any): void {
    // const county = event.value.name;
    // this.placesService.getCities(county).subscribe(data => {
    //   this.cities = data;
    //   this.orderForm.get('city').reset(); // Reset city when county changes
    // }, error => {
    //   console.error('Error loading cities: ', error);
    // });
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
}
