import {Component, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {OrderFormComponent} from "../create-order/order-form/order-form.component";
import {PackageFormComponent} from "../create-order/package-form/package-form.component";
import {PackageOverviewComponent} from "../create-order/package-overview/package-overview.component";
import {PaginatorModule} from "primeng/paginator";
import {OrderData} from "../create-order/order.data";
import {TableComponent} from "./table/table.component";
import {OrderService} from "../../../services/order.service";

@Component({
  selector: 'app-saved-addresses',
  standalone: true,
  imports: [CommonModule, ButtonDirective, OrderFormComponent, PackageFormComponent, PackageOverviewComponent, PaginatorModule, TableComponent],
  templateUrl: './saved-addresses.component.html',
  styleUrls: ['../create-order/create-order.component.css', './saved-addresses.component.css']
})
export class SavedAddressesComponent {
  @ViewChild('expeditorForm') expeditorFormComponent: OrderFormComponent;
  expeditorFormValid: boolean = false;


  constructor(private orderService: OrderService) {}

  isFormValid(): boolean {
    return this.expeditorFormValid;
  }

  onExpeditorFormValidityChange(isValid: boolean): void {
    this.expeditorFormValid = isValid;
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('form valid si salvez adresa')
      const data = this.expeditorFormComponent.orderForm.getRawValue();
      // Convert county objects to strings
      data.county = data.county.name;
      console.log('form valid si salvez adresa')
      this.orderService.saveAddress(data).subscribe(
        response => {
          console.log('Address saved successfully:', response);
        },
        error => {
          console.error('Error saving address:', error);
        });
    } else {
      console.log('Form is invalid. Cannot submit.');
    }
  }
}
