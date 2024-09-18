import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {CourierOption} from "../../../model/courier.option";
import {OrderData} from "../../../model/order-data";
import {routes} from "../../../app-routing.module";

@Component({
  selector: 'app-courier-options',
  templateUrl: './courier-options-public.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  styleUrls: ['./courier-options-public.component.css']
})
export class CourierOptionsPublicComponent implements OnInit {
  couriers: CourierOption[] = [];
  private orderData: OrderData;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['couriers']) {
        this.couriers = JSON.parse(params['couriers']);
      }
      if (params['orderData']) {
        this.orderData = JSON.parse(params['orderData']);
        console.log(this.orderData + ' Order Data');
      }
    });
  }

  selectCourier(courier: CourierOption): void {
    this.couriers.forEach(c => c.selected = false);
    courier.selected = true;
  }

  getCourierLogo(courier: string): string {
    switch (courier.toLowerCase()) {
      case 'dpd':
        return 'assets/dpd-logo.png';
      case 'cargus':
        return 'assets/cargus-logo.png';
      case 'sameday':
        return 'assets/sameday-logo.png';
      case 'gls':
        return 'assets/gls-logo.png';
      case 'fan':
        return 'assets/fan-logo.png';
      default:
        return '';
    }
  }

  orderCourier(): void {
    this.callBackendWithPickup(true);
  }

  private callBackendWithPickup(pickup: boolean) {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    if (!selectedCourier) {
      console.error('No courier selected');
      return;
    }
    if (this.orderData.expeditor == null) {
      this.router.navigate(["/order"]);
    }
    this.orderService.placeOrderFree(this.orderData, selectedCourier.courier, pickup).subscribe({
      next: (response) => {
        this.router.navigate(["/netopia"]);
        console.log('AWB generated successfully:', response);
      },
      error: (error) => {
        console.error('Error generating AWB:', error);
      },
      complete: () => {
        console.log('AWB generation completed');
      }
    });
  }


  goBack(): void {
    this.router.navigate(['/order']);
  }
}
