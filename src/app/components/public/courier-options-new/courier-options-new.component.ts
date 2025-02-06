import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {OrderService} from '../../../services/order.service';
import {AuthService} from '@auth0/auth0-angular';
import {ClientService} from '../../../services/client.service';
import {CourierOption} from '../../../model/courier.option';
import {OrderData} from '../../../model/order-data';

@Component({
  selector: 'app-courier-options-new',
  templateUrl: './courier-options-new.component.html',
  styleUrls: ['./courier-options-new.component.css'],
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, NgOptimizedImage]
})
export class CourierOptionsNewComponent implements OnInit {
  couriers: CourierOption[] = [];
  private orderData: OrderData;
  origin: string = '';  // Will hold an optional flag (for example, 'hero')

  isAuthenticated: boolean = false;
  hasContract: boolean = false; // true means contract client (dashboard flow)

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private orderService: OrderService,
    private clientService: ClientService
  ) {
  }

  /**
   * "Comandă Curier" handler.
   * For authenticated users:
   *   - if they have a contract, place the order via the backend (dashboard flow);
   *   - otherwise, navigate directly to payment.
   * For public users, navigate to the payment portal.
   */
  orderCourier(): void {
    const selected = this.couriers.find(c => c.selected);
    if (!selected) {
      console.error('No courier selected');
      return;
    }
    this.orderData.price = selected.totalPrice;

    if (this.origin === 'hero') {
      console.log('here if')
      this.router.navigate(['/order']);
    } else if (this.isAuthenticated) {
      console.log('authenticated')

      if (this.hasContract) {
        console.log('has contract')
        // Contract flow (dashboard): use the backend service.
        const selected1 = this.couriers.find(c => c.selected);
        if (!selected1) {
          console.error('No courier selected');

        }
        this.orderData.price = selected1.totalPrice;
        this.orderService.placeOrder(this.orderData, selected1.courier, true).subscribe({
          next: response => {
            console.log('AWB generated successfully:', response);
            this.router.navigate(['/dashboard/order-list']);
          },
          error: error => {
            alert("A apărut o eroare neașteptată. Încercați alt curier sau contactați-ne.");
            console.error('Error generating AWB:', error);
          },
          complete: () => console.log('AWB generation completed')
        });
      } else {
        console.log('has not contract')
        // Authenticated but without a contract: go directly to payment.
        this.router.navigate(['/dashboard/payment'], {
          queryParams: {
            amount: selected.totalPrice,
            email: this.orderData.email,
            courier: selected.courier,
            orderData: JSON.stringify(this.orderData)
          }
        });
      }
    } else {
      console.log('public flow')
      // Public flow: redirect to payment.
      this.router.navigate(['/payment'], {
        queryParams: {
          amount: selected.totalPrice,
          email: this.orderData.email,
          courier: selected.courier,
          orderData: JSON.stringify(this.orderData)
        }
      });
    }
  }

  generateAWB(): void {
    const selected = this.couriers.find(c => c.selected);
    if (!selected) {
      console.error('No courier selected');
    }
    this.orderData.price = selected.totalPrice;
    this.orderService.placeOrder(this.orderData, selected.courier, false).subscribe({
      next: response => {
        console.log('AWB generated successfully:', response);
        this.router.navigate(['/dashboard/order-list']);
      },
      error: error => {
        alert("A apărut o eroare neașteptată. Încercați alt curier sau contactați-ne.");
        console.error('Error generating AWB:', error);
      },
      complete: () => console.log('AWB generation completed')
    });
  }
  ngOnInit(): void {
    console.log('heroooooo')
    this.route.queryParams.subscribe(params => {
      if (params['couriers']) {
        this.couriers = JSON.parse(params['couriers']);
      }
      if (params['orderData']) {
        this.orderData = JSON.parse(params['orderData']);
        console.log('Order Data:', this.orderData);
      }
      if (params['origin']) {
        this.origin = params['origin'];
        console.log('origin :', this.origin);

      }
    });

    // Subscribe to authentication status and, if logged in, check the contract flag.
    this.auth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.clientService.hasContract().subscribe(
          (flag: boolean) => {
            this.hasContract = flag;
          },
          error => {
            console.error('Error checking contract flag', error);
          }
        );
      }
    });
  }

  // Mark a courier option as selected.
  selectCourier(courier: CourierOption): void {
    this.couriers.forEach(c => c.selected = false);
    courier.selected = true;
  }

  // Return the logo URL for a given courier name.
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

  // Returns true if the currently selected courier is GLS or Sameday.
  isGlsOrSamedaySelected(): boolean {
    const selected = this.couriers.find(c => c.selected);
    return selected ?
      (selected.courier.toLowerCase() === 'gls' || selected.courier.toLowerCase() === 'sameday')
      : false;
  }

  // Returns true if the logged-in user has a contract.
  isContractFlow(): boolean {
    return this.isAuthenticated && this.hasContract;
  }

  // For contract clients: call the backend order service.

  // Helper: calls the backend order service and then navigates to the dashboard order list.
  /**
   * "Înapoi" (back) handler.
   * If the order data came from the hero (shipping calculator), always navigate to the public create‐order page.
   * Otherwise, for authenticated users go to the dashboard create‐order; for public users, to the public create‐order.
   */
  goBack(): void {
    if (this.origin === 'hero') {
      this.router.navigate(['/order']);
    } else {
      if (this.isAuthenticated) {
        this.router.navigate(['/dashboard/order']);
      } else {
        this.router.navigate(['/order']);
      }
    }
  }
}
