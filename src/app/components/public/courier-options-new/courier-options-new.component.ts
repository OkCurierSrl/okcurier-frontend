import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '@auth0/auth0-angular';
import { ClientService } from '../../../services/client.service';
import { CourierOption } from '../../../model/courier.option';
import { OrderData } from '../../../model/order-data';
import {RoleService} from "../../../services/role-service.service";

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
  origin: string = '';
  isAuthenticated: boolean = false;
  hasContract: boolean = false;
  isLoading: boolean = false;  // new loading flag
  private isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private orderService: OrderService,
    private clientService: ClientService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['couriers']) {
        this.couriers = JSON.parse(params['couriers']);
      }
      if (params['orderData']) {
        this.orderData = JSON.parse(params['orderData']);
      }
      if (params['origin']) {
        this.origin = params['origin'];
      }

      this.roleService.hasRequiredRole(['ADMIN']).subscribe((hasAdminRole) => {
        this.isAdmin = hasAdminRole;
      });

    });

    this.auth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.clientService.hasContract().subscribe(
          (flag: boolean) => { this.hasContract = flag; },
          error => { console.error('Error checking contract flag', error); }
        );
      }
    });
  }

  orderCourier(): void {
    const selected = this.couriers.find(c => c.selected);
    if (!selected) {
      console.error('No courier selected');
      return;
    }
    this.orderData.price = selected.totalPrice;

    // Start loading indicator
    this.isLoading = true;
    if (this.origin === 'hero') {
      this.router.navigate(['/order']);
      this.isLoading = false;
    } else if (this.isAuthenticated) {
      if (this.hasContract || this.isAdmin) {
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
          complete: () => {
            console.log('AWB generation completed');
            this.isLoading = false;  // stop loading
          }
        });
      } else {
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
      return;
    }
    this.orderData.price = selected.totalPrice;
    this.isLoading = true;
    this.orderService.placeOrder(this.orderData, selected.courier, false).subscribe({
      next: response => {
        console.log('AWB generated successfully:', response);
        this.router.navigate(['/dashboard/order-list']);
      },
      error: error => {
        alert("A apărut o eroare neașteptată. Încercați alt curier sau contactați-ne.");
        console.error('Error generating AWB:', error);
      },
      complete: () => {
        console.log('AWB generation completed');
        this.isLoading = false;
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
      default: return '';
    }
  }

  isGlsOrSamedaySelected(): boolean {
    const selected = this.couriers.find(c => c.selected);
    return selected ? (selected.courier.toLowerCase() === 'gls' || selected.courier.toLowerCase() === 'sameday') : false;
  }

  isContractFlow(): boolean {
    return this.isAuthenticated && this.hasContract;
  }

  goBack(): void {
    if (this.origin === 'hero') {
      this.router.navigate(['/order']);
    } else {
      this.router.navigate([this.isAuthenticated ? '/dashboard/order' : '/order']);
    }
  }
}
