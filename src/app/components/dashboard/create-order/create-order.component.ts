import {AfterViewInit, Component, ElementRef, OnInit, Renderer2} from '@angular/core';
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
export class CreateOrderComponent implements OnInit, AfterViewInit {
  expeditorForm: FormGroup;
  destinatarForm: FormGroup;
  courierPackages: FormGroup[] = [];
  extraServices: any[];
  selectedServices: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder, private renderer: Renderer2, private el: ElementRef) {
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

  ngAfterViewInit(): void {
    this.setPackagesHeight();
  }

  setPackagesHeight(): void {
    const expeditorFormColumn = this.el.nativeElement.querySelector('#expeditorFormColumn');
    const packageSection = this.el.nativeElement.querySelector('#packageSection');

    if (expeditorFormColumn && packageSection) {
      const formHeight = expeditorFormColumn.offsetHeight;
      this.renderer.setStyle(packageSection, 'height', `${formHeight}px`);
      this.renderer.setStyle(packageSection.querySelector('.scrollable-content'), 'max-height', `${formHeight}px`);
    }
  }

  addPackage(): void {
    const packageForm = this.fb.group({
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(1), Validators.max(31)]]
    });
    this.courierPackages.push(packageForm);
  }

  removePackage(index: number): void {
    this.courierPackages.splice(index, 1);
  }

  toggleService(service: string): void {
    this.selectedServices[service] = !this.selectedServices[service];
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const orderDetails = {
        expeditor: this.expeditorForm.value,
        destinatar: this.destinatarForm.value,
        packages: this.courierPackages.map(pkg => pkg.value),
        extraServices: this.selectedServices
      };
      console.log('Order Details:', orderDetails);
    } else {
      this.expeditorForm.markAllAsTouched();
      this.destinatarForm.markAllAsTouched();
      this.courierPackages.forEach(pkg => pkg.markAllAsTouched());
    }
  }

  isFormValid(): boolean {
      console.log("Expeditor form valid:", this.expeditorForm.valid);
      console.log("Destinatar form valid:", this.destinatarForm.valid);
      console.log("Package count:", this.courierPackages.length > 0);

      this.courierPackages.forEach((pkg, idx) => {
          console.log(`Package ${idx + 1} valid:`, pkg.valid);
      });

      return this.expeditorForm.valid && this.destinatarForm.valid && this.courierPackages.length > 0 && this.courierPackages.every(pkg => pkg.valid);
  }
}
