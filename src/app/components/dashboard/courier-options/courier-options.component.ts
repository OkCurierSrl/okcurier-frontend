import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {OrderData} from "../create-order/order.data";
import {AuthService} from "@auth0/auth0-angular";
import {CourierOption} from "./courier.option";

@Component({
  selector: 'app-courier-options',
  templateUrl: './courier-options.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  styleUrls: ['./courier-options.component.css']
})
export class CourierOptionsComponent implements OnInit {
  couriers: CourierOption[] = [];
  private orderData: OrderData;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router, private orderService: OrderService) {}

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
      case 'dpd': return 'assets/dpd-logo.png';
      case 'cargus': return 'assets/cargus-logo.png';
      case 'sameday': return 'assets/sameday-logo.png';
      case 'gls': return 'assets/gls-logo.png';
      case 'fan': return 'assets/fan-logo.png';
      default: return '';
    }
  }

  generateAWB(): void {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    if (!selectedCourier) {
      console.error('No courier selected');
      return;
    }
    this.orderService.placeOrder(this.orderData, selectedCourier.courier).subscribe({
      next: (response) => {
        console.log('AWB generated successfully:', response);
        this.router.navigate(['/dashboard/order-list']); // Redirect to order list
      },
      error: (error) => {
        console.error('Error generating AWB:', error);
      },
      complete: () => {
        console.log('AWB generation completed');
      }
    });
  }

  orderCourier(): void {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    if (!selectedCourier) {
      console.error('No courier selected');
      return;
    }
    this.orderService.pickupOrder(this.orderData, selectedCourier.courier).subscribe({
      next: (response) => {
        console.log(this.orderData);
        console.log('Courier ordered successfully:', response);
        this.router.navigate(['/dashboard/order-list']); // Redirect to order list
      },
      error: (error) => {
        console.error('Error ordering courier:', error);
      },
      complete: () => {
        console.log('Courier ordering completed');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/order']);
  }
}
