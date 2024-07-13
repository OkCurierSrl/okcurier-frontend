import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {OrderData} from "../create-order/order.data";

interface CourierOption {
  courier: string;
  totalPrice: number;
  selected?: boolean;
}

@Component({
  selector: 'app-courier-options',
  templateUrl: './courier-options.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgOptimizedImage
  ],
  styleUrls: ['./courier-options.component.css']
})
export class CourierOptionsComponent implements OnInit {
  couriers: CourierOption[] = [];
  pickupDate = '10-07-2024';
  deadlineDate = '12-07-2024';
  private orderData: OrderData;

  constructor(private route: ActivatedRoute, private router: Router, private order: OrderService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['couriers']) {
        this.couriers = JSON.parse(params['couriers']);
      }

      if (params['orderData']) {
        this.orderData = JSON.parse(params['orderData']);
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
    this.order.generateAwb(this.orderData)
    this.router.navigate(['/order-list']); // Redirect to order list
    console.log('Generating AWB for selected courier...');
  }

  orderCourier(): void {
    this.order.orderCourier(this.orderData)
    this.router.navigate(['/order-list']); // Redirect to order list
    console.log('Ordering courier...');
  }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
