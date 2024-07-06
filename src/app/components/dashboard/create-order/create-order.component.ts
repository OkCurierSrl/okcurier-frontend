import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderFormComponent} from "./order-form/order-form.component";
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonDirective} from "primeng/button";
import {PackageFormComponent} from "./package-form/package-form.component";
import {PackageOverviewComponent} from "./package-overview/package-overview.component";

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderFormComponent, InputTextModule, CheckboxModule, ButtonDirective, PackageFormComponent, FormsModule, PackageOverviewComponent],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit, AfterViewInit {
  @ViewChild('expeditorForm') expeditorForm: OrderFormComponent;
  @ViewChild('destinatarForm') destinatarForm: OrderFormComponent;

  courierPackages: { form: FormGroup, valid: boolean }[] = [];
  extraServices: any[];
  selectedServices: { [key: string]: boolean } = {};
  assuranceValue: number | null = null;
  cashOnDeliveryValue: number | null = null;

  expeditorFormValid: boolean = false;
  destinatarFormValid: boolean = false;

  constructor(private fb: FormBuilder, private renderer: Renderer2, private el: ElementRef) {
    this.extraServices = [
      {label: 'Livrare Sambata', value: 'saturdayDelivery'},
      {label: 'Document la schimb', value: 'exchangeDocument'},
      {label: 'Colet la schimb', value: 'exchangePackage'},
      {label: 'Deschidere Colet', value: 'openPackage'},
      {label: 'Asigurare', value: 'insurance'},
      {label: 'Adauga pretul transportului in ramburs', value: 'addTransportCost'},
      {label: 'Ramburs in cont', value: 'cashOnDelivery'}
    ];
  }

  ngOnInit(): void {
    this.addPackage(); // Initialize with one package form
  }

  ngAfterViewInit(): void {
    this.setPackagesHeight();
  }

  onExpeditorFormValidityChange(isValid): void {
    console.log(isValid)
    console.log(`Type of variable: ${typeof isValid}`);
    this.expeditorFormValid = isValid;
    this.checkFormsValidity();
  }

  onDestinatarFormValidityChange(isValid: boolean): void {
    this.destinatarFormValid = isValid;
    this.checkFormsValidity();
  }

  onPackageValidityChange(index: number, isValid: boolean): void {
    if (this.courierPackages[index]) {
      this.courierPackages[index].valid = isValid;
    }
    this.checkFormsValidity();
  }

  setPackagesHeight(): void {
    const expeditorFormColumn = this.el.nativeElement.querySelector('#expeditorFormColumn');
    const packageSection = this.el.nativeElement.querySelector('#packageSection');
    const packageOverview = this.el.nativeElement.querySelector('#packageOverview');

    if (expeditorFormColumn && packageSection && packageOverview) {
      const formHeight = expeditorFormColumn.offsetHeight - packageOverview.offsetHeight - 16;//1rem
      this.renderer.setStyle(packageSection, 'height', `${formHeight}px`);
      this.renderer.setStyle(packageSection.querySelector('.scrollable-content'), 'max-height', `${formHeight}px`);
    }
  }

  addPackage(): void {
    const packageForm = this.fb.group({
      length: [0, [Validators.required, Validators.min(1)]],
      width: [0, [Validators.required, Validators.min(1)]],
      height: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(1), Validators.max(31)]]
    });

    this.courierPackages.push({ form: packageForm, valid: false });
  }

  removePackage(index: number): void {
    this.courierPackages.splice(index, 1);
  }

  toggleService(service: string): void {
    this.selectedServices[service] = !this.selectedServices[service];
    if (!this.selectedServices['insurance']) {
      this.assuranceValue = null;
    }
    if (!this.selectedServices['cashOnDelivery']) {
      this.cashOnDeliveryValue = null;
    }
  }


  checkFormsValidity(): void {
    console.log('Expeditor form valid:', this.expeditorFormValid);
    console.log('Destinatar form valid:', this.destinatarFormValid);
    console.log('Package count:', this.courierPackages.length > 0);

    this.courierPackages.forEach((pkg, idx) => {
      console.log(`Package ${idx + 1} valid:`, pkg.valid);
    });
  }

  isFormValid(): boolean {
    return this.expeditorFormValid && this.destinatarFormValid && this.courierPackages.length > 0 && this.courierPackages.every(pkg => pkg.valid);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Submit the form
      console.log('Form is valid. Submitting...');
      // Add your form submission logic here
    } else {
      console.log('Form is invalid. Cannot submit.');
    }
  }
}
