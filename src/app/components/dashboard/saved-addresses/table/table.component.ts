import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarModule} from "primeng/calendar";
import {PaginatorModule} from "primeng/paginator";
import {Address} from "../../create-order/order.data";
import {OrderService} from "../../../../services/order.service";

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
    this.orderService.getAddresses().subscribe((addresses: Address[]) => {
      this.filteredOrders = addresses;
    });
  }
}
