import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {Shipment} from "../../../model/shipment";
import {OrderService} from "../../../services/order.service";
import {shouldBeautify} from "@angular-devkit/build-angular/src/utils/environment-options";

interface Package {
  number: string;
  weight: number;
  dimensions: string;
}

interface Order {
  awb: string;
  courier: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  creationDate: string;
  pickupDate: string;
  count: number;
  iban: string;
  orderNumber: string;
  packageCount: number;
  weight: number;
  cashOnDelivery: number;
  status: string;
  showPackages?: boolean;
  packages?: Package[];
}

@Component({
  selector: 'app-order-list',
  templateUrl: 'order-list.component.html',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    CalendarModule,
    NgIf,
    NgForOf,
  ],
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Shipment[] = []; // This should be fetched from the service
  filteredOrders: Order[] = [];
  pages: number[] = [1, 2, 3, 4, 5]; // Mock pagination data
  currentPage: number = 1;
  searchTerm: string = '';
  filterProperty: string = 'all';

  filter: any = {
    awb: '',
    courier: '',
    senderName: '',
    senderAddress: '',
    recipientName: '',
    recipientAddress: '',
    creationDateRange: null,
    pickupDateRange: null,
    count: '',
    iban: '',
    orderNumber: '',
    packageCount: '',
    weight: '',
    cashOnDelivery: '',
    status: ''
  };

  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe(shipments => {
      this.orders = shipments;
      this.filteredOrders = [...this.orders]; // Initialize the filtered orders
      console.log(this.orders);
    });
  }
  getCourierLogo(courier: string | undefined): string {
    if (!courier) {
      return ''; // Return a default or empty string if courier is undefined or null
    }

    switch (courier.toLowerCase()) {
      case 'dpd':
        return 'assets/dpd-logo.png';
      case 'cargus':
        return 'assets/cargus-logo.png';
      case 'fan':
        return 'assets/fan-logo.png';
      case 'gls':
        return 'assets/gls-logo.png';
      case 'sameday':
        return 'assets/sameday-logo.png';
      default:
        return ''; // Return a default or empty string if no match is found
    }
  }

  getStatusClass(status: string): string {
    if (!status) {
      console.log('nu am gasit status')
      return ''; // Return a default or empty string if courier is undefined or null
    }
    console.log('am gasit status'  + status)
    let clas = '';
    switch (status.toUpperCase()) {
      case 'AWB_GENERAT': clas =  'status-awb-generat';
        break;
      case 'COMANDA_TRIMISA': clas =  'status-comanda-trimisa';
        break;
      case 'AWB_RIDICAT': clas =  'status-ridicat';
        break;
      case 'TRANZIT': clas =  'status-in-tranzit';
        break;
      case 'IN_LIVRARE': clas =  'status-in-livrare';
        break;
      case 'LIVRAT': clas =  'status-livrat';
        break;
      case 'RAMBURSAT': clas =  'status-rambursat';//
          break;
      case 'RETURNARE': clas =  'status-clas = are';//
          break;
      case 'REDIRECTIONARE': clas =  'status-redirectionare';
        break;
      case 'EROARE': clas =  'status-eroare';
        break;
      default: clas =  '';
        break;
    }
    console.log('asadeci ' +  clas);
    return clas;
  }
  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesAwb = order.awb.includes(this.filter.awb);
      const matchesCourier = order.courier.includes(this.filter.courier);
      const matchesSenderName = order.senderName.includes(this.filter.senderName);
      const matchesSenderAddress = order.senderAddress.includes(this.filter.senderAddress);
      const matchesRecipientName = order.recipientName.includes(this.filter.recipientName);
      const matchesRecipientAddress = order.recipientAddress.includes(this.filter.recipientAddress);
      const matchesCount = order.count.toString().includes(this.filter.count);
      const matchesIban = order.iban.includes(this.filter.iban);
      const matchesOrderNumber = order.orderNumber.includes(this.filter.orderNumber);
      const matchesPackageCount = order.packageCount.toString().includes(this.filter.packageCount);
      const matchesWeight = order.weight.toString().includes(this.filter.weight);
      const matchesCashOnDelivery = order.cashOnDelivery.toString().includes(this.filter.cashOnDelivery);
      const matchesStatus = order.status.includes(this.filter.status);

      const matchesCreationDateRange = this.filter.creationDateRange
        ? new Date(order.creationDate) >= new Date(this.filter.creationDateRange[0])
        && new Date(order.creationDate) <= new Date(this.filter.creationDateRange[1])
        : true;

      const matchesPickupDateRange = this.filter.pickupDateRange
        ? new Date(order.pickupDate) >= new Date(this.filter.pickupDateRange[0])
        && new Date(order.pickupDate) <= new Date(this.filter.pickupDateRange[1])
        : true;

      return matchesAwb && matchesCourier && matchesSenderName && matchesSenderAddress
        && matchesRecipientName && matchesRecipientAddress && matchesCount && matchesIban
        && matchesOrderNumber && matchesPackageCount && matchesWeight && matchesCashOnDelivery
        && matchesStatus && matchesCreationDateRange && matchesPickupDateRange;
    });

    this.currentPage = 1;
    this.pages = this.getPagesArray();
  }

  getPagesArray() {
    const totalPages = Math.ceil(this.filteredOrders.length / 3);
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  viewOrder(order: Order): void {
    // Get the current path from the activated route
    const currentPath = this.router.url

    // Determine the base path for navigation
    const basePath = currentPath.replace(/\/order-list$/, ''); // Remove /view from the end

    // Construct the target path
    const targetPath = `${basePath}/track/${order.awb}`;

    // Navigate to the dynamically constructed path
    this.router.navigate([targetPath]);
  }

  downloadOrder(order: Order): void {
    // Handle download order logic
    console.log('Download order', order);
  }

  printOrder(order: Order): void {
    // Handle print order logic
    console.log('Print order', order);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Load previous page data
    }
  }

  nextPage(): void {
    if (this.currentPage < this.pages.length) {
      this.currentPage++;
      // Load next page data
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    // Load specific page data
  }

  exportToExcel(): void {
    // Handle export to Excel logic
    console.log('Export to Excel');
  }

  printOrders(): void {
    // Handle print orders logic
    console.log('Print orders');
  }
}
