import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {CourierOption} from "../../../model/courier.option";
import {OrderData} from "../../../model/order-data";

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
              private router: Router) {
  }

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
      case 'dpd':
        return 'assets/dpd-logo.png';
      case 'cargus':
        return 'assets/cargus-logo.png';
      case 'sameday':
        return 'assets/sameday-logo.png';
      case 'gls':
        return 'assets/gls-logo.png';
      default:
        return '';
    }
  }

  orderCourier(): void {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    if (!selectedCourier) {
      console.error('No courier selected');
      return; // Prevent further execution if no courier is selected
    }

    if (!this.orderData) {
      console.error('Order data is missing');
      this.router.navigate(['/order']);
      return;
    }

    const paymentAmount = selectedCourier.totalPrice;
    this.orderData.price = paymentAmount; // Set the order price for reference

    // Navigate to the payment portal
    this.router.navigate(['/payment'], {
      queryParams: {
        amount: paymentAmount,
        email: this.orderData.email,
        courier: selectedCourier.courier,
        orderData: JSON.stringify(this.orderData)
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
