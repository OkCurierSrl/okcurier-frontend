import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderFormComponent} from "./order-form/order-form.component";
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonDirective} from "primeng/button";
import {PackageFormComponent} from "./package-form/package-form.component";

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderFormComponent, InputTextModule, CheckboxModule, ButtonDirective, PackageFormComponent],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent {
  packages: FormGroup[] = [];

  constructor(private fb: FormBuilder) {
    this.addPackage();
  }

  addPackage(): void {
    const packageForm = this.fb.group({
      length: [0, Validators.required],
      width: [0, Validators.required],
      height: [0, Validators.required],
      weight: [0, Validators.required],
      saturdayDelivery: [false],
      exchangeDocument: [false],
      exchangePackage: [false],
      openPackage: [false],
      insurance: [false],
      addTransportCost: [false],
      cashOnDelivery: [false]
    });

    this.packages.push(packageForm);
  }

  removePackage(index: number): void {
    this.packages.splice(index, 1);
  }

  onSubmit(): void {
    console.log('Packages:', this.packages.map(pkg => pkg.value));
  }

}
