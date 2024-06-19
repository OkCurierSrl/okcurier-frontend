import { Component, OnInit } from '@angular/core';
import {ServicePricing, ServicePricingService} from "../../services/service-pricing.service";
import {NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

interface Courier {
  name: string;
  logo: string;
}

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

  constructor(private servicePricingService: ServicePricingService) {}

  ngOnInit(): void {
    this.loadServicePricing();
  }

  loadServicePricing(): void {
    this.servicePricingService.getAllServicePricing().subscribe(data => {
      this.services = data;
    });
  }

  selectCourier(courier: string): void {
    this.selectedCourier = courier;
    this.fetchPricesForCourier(courier);
  }

  fetchPricesForCourier(courier: string): void {
    // Simulate fetching prices for the selected courier
    this.servicePricingService.getAllServicePricing().subscribe(data => {
      this.services = data.filter(service => service.courierCompany.name === courier);
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
    console.log('Prices modified', this.services);
    this.modified = true;
    this.services.forEach(service => {
      this.servicePricingService.saveServicePricing(service).subscribe();
    });
    setTimeout(() => {
      this.modified = false;
    }, 3000);
  }
}
