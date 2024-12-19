import {Component, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {OrderFormComponent} from "../create-order/order-form/order-form.component";
import {PackageFormComponent} from "../create-order/package-form/package-form.component";
import {PackageOverviewComponent} from "../create-order/package-overview/package-overview.component";
import {PaginatorModule} from "primeng/paginator";
import {TableComponent} from "./table/table.component";
import {OrderService} from "../../../services/order.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-saved-addresses',
  standalone: true,
  imports: [CommonModule, ButtonDirective, OrderFormComponent, PackageFormComponent, PackageOverviewComponent, PaginatorModule, TableComponent],
  templateUrl: './saved-addresses.component.html',
  styleUrls: ['../create-order/create-order.component.css', './saved-addresses.component.css']
})
export class SavedAddressesComponent {
  @ViewChild('expeditorForm') expeditorFormComponent: OrderFormComponent;
  @ViewChild(TableComponent) tableComponent: TableComponent;  // Access the TableComponent

  expeditorFormValid: boolean = false;
  shortName: string;  // New property for shortName
  shortNameError: string = '';  // Error message for shortName

  constructor(private orderService: OrderService, private router: Router) {}

  isFormValid(): boolean {
    return this.expeditorFormValid && !!this.shortName && !this.shortNameError;  // Include shortName in validation and check for errors
  }

  checkShortNameUnique(): void {
    this.orderService.getAddresses().subscribe(addresses => {
      const addressWithSameShortName = addresses.find(address => address.shortName === this.shortName);
      if (addressWithSameShortName) {
        this.shortNameError = 'This short name is already in use. Please choose another one.';
      } else {
        this.shortNameError = '';
      }
    });
  }


  onExpeditorFormValidityChange(isValid: boolean): void {
    this.expeditorFormValid = isValid;
  }

  onSubmit(): void {
    this.checkShortNameUnique();  // Check if the shortName is unique before submitting

    if (this.isFormValid()) {
      const data = this.expeditorFormComponent.orderForm.getRawValue();
      data.shortName = this.shortName;  // Add shortName to the data object

      this.orderService.saveAddress(data).subscribe(
        response => {
          this.tableComponent.refreshTable();  // Refresh the table component
          this.router.navigate(['/dashboard/favorite-addresses']);
        },
        error => {
          console.error('Error saving address:', error);

        }
      );
    } else {
      console.log('Form is invalid or short name is not unique. Cannot submit.');
    }
  }
}
