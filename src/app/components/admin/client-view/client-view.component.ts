import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import {Discount} from "../../../model/discount";
import {ClientService} from "../../../services/client.service";
import {Client} from "../../../model/client";
import {OkCurierServicesDisplayMap, OkCurierServicesEnum} from "../../../model/okCurierServicesEnum";
import {Courier} from "../admin-prices/courier"; // Define an interface matching the backend Discount class

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    KeyValuePipe
  ],
  styleUrls: ['./client-view.component.css', '../../admin/admin-prices/admin-prices.component.css']
})
export class ClientViewComponent implements OnInit {
  clientName: string = '';
  email: string = '';
  discount: Discount = null;
  modified: boolean = false;
  activeTab: string = 'info'; // Default tab
  client: Client;
  couriers: Courier[] = [
    {logo: 'assets/dpd.png', name: 'DPD'},
    {logo: 'assets/cargus.png', name: 'CARGUS'},
    {logo: 'assets/fan.png', name: 'FAN'},
    {logo: 'assets/sameday.png', name: 'SAMEDAY'},
    {logo: 'assets/gls.png', name: 'GLS'}
  ];
  selectedCourier: string | null = null;
  alertBoolean: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.clientService.getClientByEmail(email).subscribe(
          (client: Client) => {
            this.client = client;
            this.clientName = client.name;
            this.fetchPricesForCourier('DPD');
          },
          error => {
            console.error('Error fetching client data', error);
            // Handle error case, e.g., show a notification to the user
          }
        );
      }
    });
  }

  trackByKey(index: number, item: { key: string; value: number }): string {
    return item.key; // Return the unique key for each item
  }

  markAsModified(serviceKey: string, newValue: number): void {
    // Update only the specific service value in the map
    if (this.discount && this.discount.servicesEnumDoubleMap) {
      this.discount.servicesEnumDoubleMap[serviceKey] = newValue;
      this.modified = true;
      this.alertBoolean = false;
    }
  }

  selectCourier(courier: string): void {
    this.selectedCourier = courier;
    this.modified = false;
    this.alertBoolean = false;
    this.fetchPricesForCourier(courier);
    this.cdr.detectChanges(); // Force Angular to update the UI
  }

  fetchPricesForCourier(courier: string): void {
    // Ensure you are selecting the correct courier and reset the state
    this.selectedCourier = courier;

    // Filter and select the discount relevant to the selected courier
    const discounts = this.client.billing_info.discounts.filter(
      (discount) => discount.courierCompanyEnum === courier
    );
    // Create a new copy to ensure change detection works correctly
    if (discounts.length > 0) {
      this.discount = { ...discounts[0] }; // Use a new copy to avoid direct mutation issues
    } else {
      this.discount = null; // Reset discount if no matching discount is found
    }
  }


  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getServiceDisplayName(serviceKey: string): string {
    const serviceEnum = OkCurierServicesEnum[serviceKey as keyof typeof OkCurierServicesEnum];
    return OkCurierServicesDisplayMap[serviceEnum] || serviceKey;
  }

  saveDiscounts(): void {
    if (this.modified) {
      this.clientService.modifyDiscounts(this.client.email, this.discount).subscribe(
        () => {
          this.alertBoolean = true;
          this.modified = false;
        },
        (error) => {
          console.error('Error saving discounts', error);
        }
      );
    }
  }
}
