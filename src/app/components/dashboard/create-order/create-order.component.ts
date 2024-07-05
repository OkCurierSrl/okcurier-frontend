import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderFormComponent} from "./order-form/order-form.component";
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonDirective} from "primeng/button";
import {PackageFormComponent} from "./package-form/package-form.component";

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderFormComponent, InputTextModule, CheckboxModule, ButtonDirective, PackageFormComponent, FormsModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit {
  expeditorForm: FormGroup;
  destinatarForm: FormGroup;
  courierPackages: FormGroup[] = [];
  extraServices: any;
  selectedServices: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder) {
    this.extraServices = [
      { label: 'Livrare Sambata', value: 'saturdayDelivery' },
      { label: 'Document la schimb', value: 'exchangeDocument' },
      { label: 'Colet la schimb', value: 'exchangePackage' },
      { label: 'Deschidere Colet', value: 'openPackage' },
      { label: 'Asigurare', value: 'insurance' },
      { label: 'Adauga pretul transportului in ramburs', value: 'addTransportCost' },
      { label: 'Ramburs in cont', value: 'cashOnDelivery' }
    ];

  }

  ngOnInit(): void {
    this.expeditorForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,12}$')]],
      phone2: ['', Validators.pattern('^\\+?[0-9]{10,12}$')],
      state: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', Validators.required],
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: ['']
    });

    this.destinatarForm = this.fb.group({
      name: ['', Validators.required],
      phone1: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,12}$')]],
      phone2: ['', Validators.pattern('^\\+?[0-9]{10,12}$')],
      state: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', Validators.required],
      block: [''],
      staircase: [''],
      floor: [''],
      apartment: ['']
    });

    this.addPackage(); // Initialize with one package form
  }

  toggleService(service: string) {
    this.selectedServices[service] = !this.selectedServices[service];
  }

  addPackage(): void {
    const packageForm = this.fb.group({
      length: ['', Validators.required],
      width: ['', Validators.required],
      height: ['', Validators.required],
      weight: ['', Validators.required],
      saturdayDelivery: [false],
      exchangeDocument: [false],
      exchangePackage: [false],
      openPackage: [false],
      insurance: [false],
      addTransportCost: [false],
      cashOnDelivery: [false]
    });
    this.courierPackages.push(packageForm);
  }

  removePackage(index: number): void {
    this.courierPackages.splice(index, 1);
  }

  onSubmit(): void {
    if (this.allFormsValid()) {
      // Handle form submission
      console.log('All forms are valid. Submitting...');
    } else {
      // Mark all fields as touched to show validation errors
      this.expeditorForm.markAllAsTouched();
      this.destinatarForm.markAllAsTouched();
      this.courierPackages.forEach(courierPackage => courierPackage.markAllAsTouched());
    }
  }

  allFormsValid(): boolean {
    return this.expeditorForm.valid && this.destinatarForm.valid && this.courierPackages.every(courierPackage => courierPackage.valid);
  }
}
