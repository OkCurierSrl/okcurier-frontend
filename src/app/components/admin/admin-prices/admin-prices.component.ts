import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ServicePricingService} from "../../../services/service-pricing.service";
import {NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Courier} from "../../../model/courier";
import {ServicePricing} from "../../../model/service.pricing";

@Component({
  selector: 'app-admin-prices',
  templateUrl: './admin-prices.component.html',
  standalone: true,
  imports: [
    TitleCasePipe,
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./admin-prices.component.css']
})
export class AdminPricesComponent implements OnInit {
  services: ServicePricing[] = [];
  couriers: Courier[] = [
    { logo: 'assets/dpd.png', name: 'DPD' },
    { logo: 'assets/cargus.png', name: 'CARGUS' },
    { logo: 'assets/fan.png', name: 'FAN' },
    { logo: 'assets/sameday.png', name: 'SAMEDAY' },
    { logo: 'assets/gls.png', name: 'GLS' }
  ];

  selectedCourier: string | null = null;
  modified: boolean = false;

  constructor(private servicePricingService: ServicePricingService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.selectedCourier = this.couriers[0].name;
    this.fetchPricesForCourier(this.couriers[0].name);
  }
  selectCourier(courier: string): void {
    this.selectedCourier = courier;
    this.fetchPricesForCourier(courier);
  }

  fetchPricesForCourier(courier: string): void {
    this.servicePricingService.getAllServicePricing().subscribe(data => {
      this.services = data.filter(service => service.courierCompany.nameEnum === courier);
      this.cdr.detectChanges(); // Force Angular to update the UI

    });
  }

  calculatePremiumResult(service: ServicePricing): string {
    const baseCalculation = service.basePrice + service.premiumAddedPrice;
    return baseCalculation.toFixed(2);
  }

  calculateStandardResult(service: ServicePricing): string {
    const baseCalculation = service.basePrice + service.standardAddedPrice;
    return baseCalculation.toFixed(2);
  }

  modifyPrices(): void {
    this.modified = true;
    this.services.forEach(service => {
      this.servicePricingService.saveServicePricing(service).subscribe();
    });
    setTimeout(() => {
      this.modified = false;
    }, 3000);
  }
}
