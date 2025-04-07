import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '@auth0/auth0-angular';
import { ClientService } from '../../../services/client.service';
import { CourierOption } from '../../../model/courier.option';
import { OrderData } from '../../../model/order-data';
import { RoleService } from "../../../services/role-service.service";
import { LockerSelectorComponent } from "../../shared/locker-selector/locker-selector.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-courier-options-new',
  templateUrl: './courier-options-new.component.html',
  styleUrls: ['./courier-options-new.component.css'],
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, NgOptimizedImage, LockerSelectorComponent, FormsModule]
})
export class CourierOptionsNewComponent implements OnInit {
  couriers: CourierOption[] = [];
  orderData: OrderData;
  isLoading = false;
  isAdmin: boolean = false;
  isAuthenticated: boolean = false;
  hasContract: boolean = false;
  origin: string = '';
  useLocker: boolean = false;
  selectedLockerId: string = '';
  selectedLockerCourier: string = '';

  constructor(
    private router: Router,
    private orderService: OrderService,
    private auth: AuthService,
    private clientService: ClientService,
    private roleService: RoleService
  ) {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as {couriers: any, orderData: OrderData};
      this.couriers = state.couriers;
      this.orderData = state.orderData;
    }
  }

  ngOnInit(): void {
    if (!this.orderData || !this.couriers) {
      // Handle case when data is not available
      this.router.navigate(['/']);
      return;
    }
    this.roleService.hasRequiredRole(['ADMIN']).subscribe((hasAdminRole) => {
      this.isAdmin = hasAdminRole;
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
            // Fix: Use conditional routing based on isAdmin
            const routePath = this.isAdmin ? '/admin/order-list' : '/dashboard/order-list';
            this.router.navigate([routePath]);
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
      } else {
        const basePath = this.isAdmin ? '/admin' : '/dashboard';
        this.router.navigate([`${basePath}/payment`], {
          state: {
            amount: selected.totalPrice,
            email: this.orderData.email,
            courier: selected.courier,
            orderData: this.orderData
          }
        });
      }
    } else {
      this.router.navigate(['/payment'], {
        state: {
          amount: selected.totalPrice,
          email: this.orderData.email,
          courier: selected.courier,
          orderData: this.orderData
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
        const routePath = this.isAdmin ? '/admin/order-list' : '/dashboard/order-list';
        this.router.navigate([routePath]);
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

    // Reset locker selection when courier changes
    if (this.selectedLockerCourier !== courier.courier) {
      this.selectedLockerId = '';
      this.selectedLockerCourier = '';
    }
  }

  onLockerSelected(event: { lockerId: string, courier: string }): void {
    this.selectedLockerId = event.lockerId;
    this.selectedLockerCourier = event.courier;

    console.log('Parent received locker selection:', event);

    // Update orderData with locker information
    if (this.orderData) {
      this.orderData.useLocker = true;
      this.orderData.lockerId = event.lockerId;
      this.orderData.lockerCourier = event.courier;
      console.log('Updated orderData with locker info:', this.orderData);
    }
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

  hasSelectedCourier(): boolean {
    return this.couriers.some(courier => courier.selected);
  }

  setUseLocker(value: boolean): void {
    this.useLocker = value;
    if (!value) {
      // Reset locker selection when disabling locker delivery
      this.selectedLockerId = '';
      this.selectedLockerCourier = '';
      if (this.orderData) {
        this.orderData.useLocker = false;
        this.orderData.lockerId = '';
        this.orderData.lockerCourier = '';
      }
    }
  }

  getSelectedCourierName(): string {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    return selectedCourier ? selectedCourier.courier : '';
  }
}
