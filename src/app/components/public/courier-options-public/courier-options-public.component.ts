import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {AuthService} from "@auth0/auth0-angular";
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
              private auth: AuthService,
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
    const selectedCourier = this.couriers.find(courier => courier.selected);
      this.orderService.pickupOrder(this.orderData, selectedCourier.courier).subscribe(
          (response) => {
              console.log('Order Placed successfully', response);
          },
          (error) => {
              console.error('Error placing the order', error);
          }
      );

    if (selectedCourier) {
      this.router.navigate(['/netopia'], {
        state: {
          selectedCourier: selectedCourier,
          orderData: this.orderData
        }
      }); // Redirect to Netopia with the selected courier and orderData
    } else {
      console.log('No courier selected');
    }
  }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
