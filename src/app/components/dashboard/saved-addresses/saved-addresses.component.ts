import {Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
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
  shortName: string;

  constructor(private orderService: OrderService, private router: Router) {}

  isFormValid(): boolean {

    if (!this.expeditorFormComponent || !this.expeditorFormComponent.formGroup) {
      return false;
    }

    const invalidControls = Object.keys(this.expeditorFormComponent.formGroup.controls).filter(
      (controlName) => this.expeditorFormComponent.formGroup.get(controlName)?.invalid
    );
    return this.expeditorFormComponent.orderForm.valid;
  }

  onExpeditorFormValidityChange(isValid: boolean): void {
    this.expeditorFormValid = isValid;
  }

  onSubmit(): void {
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
          alert('Adresa nu a putut fi salvata.\nAsigurati-va ca este unica')
        }
      );
    } else {
      console.log('Form is invalid or short name is not unique. Cannot submit.');
    }
  }
}
