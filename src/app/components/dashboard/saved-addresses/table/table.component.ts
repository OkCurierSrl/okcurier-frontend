import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarModule} from "primeng/calendar";
import {PaginatorModule} from "primeng/paginator";
import {OrderService} from "../../../../services/order.service";
import {Address} from "../../../../model/address";

@Component({
  selector: 'app-table',
  standalone: true,
    imports: [CommonModule, CalendarModule, PaginatorModule],
  templateUrl: './table.component.html',
  styleUrls: ['table.component.css', '../../order-list/order-list.component.css']
})
export class TableComponent {
  filteredOrders: Address[]


  constructor(private orderService: OrderService) {
    this.loadAddresses();
  }

  private loadAddresses() {
    this.orderService.getAddresses().subscribe((addresses: Address[]) => {
      this.filteredOrders = addresses;
    });
  }

  refreshTable(): void {
    this.loadAddresses();  // Re-fetch the addresses when called
  }
  removeAddress(order: any): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.orderService.deleteAddress(order.shortName).subscribe(() => {
        // Remove the address from the local array
        this.filteredOrders = this.filteredOrders.filter(item => item.shortName !== order.shortName);
      }, error => {
        console.error('Error deleting address:', error);
      });
    }
  }



}
