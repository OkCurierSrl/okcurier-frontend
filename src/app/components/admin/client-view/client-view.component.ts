import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import {Discount} from "../../../model/discount";
import {ClientService} from "../../../services/client.service";
import {Client} from "../../../model/client";
import {OkCurierServicesDisplayMap, OkCurierServicesEnum} from "../../../model/okCurierServicesEnum";
import {Courier} from "../../../model/courier";
import {ServicePricingService} from "../../../services/service-pricing.service";
import {ServicePricing} from "../../../model/service.pricing"; // Define an interface matching the backend Discount class

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
    {logo: 'assets/sameday.png', name: 'SAMEDAY'},
    {logo: 'assets/gls.png', name: 'GLS'}
  ];
  selectedCourier: string | null = null;
  alertBoolean: boolean = false;
  private services: ServicePricing[];
  isContractModified = false;
  originalContractNumber: string = '';

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    private servicePricingService: ServicePricingService
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
            this.fetchDiscountsForCourier('DPD');
            this.fetchPricesForCourier('DPD');
            this.originalContractNumber = this.client?.billing_info?.contract_number || '';
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
    this.fetchDiscountsForCourier(courier);
    this.fetchPricesForCourier(courier);
    this.cdr.detectChanges(); // Force Angular to update the UI
  }

  fetchPricesForCourier(courier: string): void {
    this.servicePricingService.getAllServicePricing().subscribe(data => {
      this.services = data.filter(service => service.courierCompany.nameEnum === courier);
      this.cdr.detectChanges(); // Force Angular to update the UI
    });
  }

  fetchDiscountsForCourier(courier: string): void {
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

  getBasicPrice(service: string) {

    let servicePricing1 = this.services.filter(
      (servicePricing) => servicePricing.serviceName === this.getServiceDisplayName(service)).pop();
    return servicePricing1.basePrice + servicePricing1.premiumAddedPrice;
  }

  getFinalPriceWithDiscount(key: string) {
    let number = this.getBasicPrice(key) - this.discount.servicesEnumDoubleMap[key]/100 * this.getBasicPrice(key);
    return number.toFixed(2);
  }

  onContractNumberChange(newValue: string) {
    this.isContractModified = newValue !== this.originalContractNumber;
  }

  saveContractNumber() {
    if (!this.client || !this.client.billing_info) return;

    const updatedBillingInfo = {
      ...this.client.billing_info,
      contract_number: this.client.billing_info.contract_number
    };

    this.clientService.modifyBillingInfo(this.client.email, updatedBillingInfo)
      .subscribe({
        next: () => {
          this.originalContractNumber = this.client.billing_info.contract_number;
          this.isContractModified = false;
          // Show success message
          this.alertBoolean = true;
          setTimeout(() => this.alertBoolean = false, 3000);
        },
        error: (error) => {
          console.error('Error updating contract number:', error);
          // Optionally show error message to user
        }
      });
  }
}
