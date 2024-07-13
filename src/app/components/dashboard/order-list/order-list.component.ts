import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";

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
  orders: Order[] = []; // This should be fetched from the service
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadMockData();
    // TODO load real data
    this.filterOrders();
  }

  loadMockData(): void {
    this.orders = [
      {
        awb: '8089868547',
        courier: 'dpd',
        senderName: 'John Doe',
        senderAddress: '123 Main St, City, Country',
        recipientName: 'Jane Smith',
        recipientAddress: '456 Elm St, City, Country',
        creationDate: '09-07-2024',
        pickupDate: '10-07-2024',
        count: 1,
        iban: 'RO49AAAA1B31007593840000',
        orderNumber: '1178/27.05.2024',
        packageCount: 1,
        weight: 2.5,
        cashOnDelivery: 123.92,
        status: 'awb generat',
        packages: [
          { number: '1', weight: 2.5, dimensions: '30x30x30 cm' }
        ]
      },
      {
        awb: '8089868548',
        courier: 'cargus',
        senderName: 'Alice Johnson',
        senderAddress: '789 Oak St, City, Country',
        recipientName: 'Bob Brown',
        recipientAddress: '101 Pine St, City, Country',
        creationDate: '09-07-2024',
        pickupDate: '11-07-2024',
        count: 1,
        iban: 'RO49AAAA1B31007593840001',
        orderNumber: '1179/27.05.2024',
        packageCount: 2,
        weight: 5.0,
        cashOnDelivery: 200.00,
        status: 'comanda trimisa',
        packages: [
          { number: '1', weight: 2.5, dimensions: '30x30x30 cm' },
          { number: '2', weight: 2.5, dimensions: '30x30x30 cm' }
        ]
      },
      {
        awb: '8089868549',
        courier: 'fan',
        senderName: 'Charlie Davis',
        senderAddress: '102 Maple St, City, Country',
        recipientName: 'Dana White',
        recipientAddress: '103 Birch St, City, Country',
        creationDate: '08-07-2024',
        pickupDate: '12-07-2024',
        count: 1,
        iban: 'RO49AAAA1B31007593840002',
        orderNumber: '1180/27.05.2024',
        packageCount: 3,
        weight: 7.5,
        cashOnDelivery: 150.75,
        status: 'neridicat',
        packages: [
          { number: '1', weight: 2.5, dimensions: '30x30x30 cm' },
          { number: '2', weight: 2.5, dimensions: '30x30x30 cm' },
          { number: '3', weight: 2.5, dimensions: '30x30x30 cm' }
        ]
      },
      {
        awb: '8089868550',
        courier: 'gls',
        senderName: 'Eve Martinez',
        senderAddress: '104 Cedar St, City, Country',
        recipientName: 'Franklin Green',
        recipientAddress: '105 Spruce St, City, Country',
        creationDate: '07-07-2024',
        pickupDate: '09-07-2024',
        count: 1,
        iban: 'RO49AAAA1B31007593840003',
        orderNumber: '1181/27.05.2024',
        packageCount: 1,
        weight: 3.0,
        cashOnDelivery: 175.50,
        status: 'intarziat',
        packages: [
          { number: '1', weight: 3.0, dimensions: '30x30x30 cm' }
        ]
      },
      {
        awb: '8089868551',
        courier: 'sameday',
        senderName: 'Grace Hopper',
        senderAddress: '106 Elm St, City, Country',
        recipientName: 'Heidi Klum',
        recipientAddress: '107 Pine St, City, Country',
        creationDate: '06-07-2024',
        pickupDate: '08-07-2024',
        count: 1,
        iban: 'RO49AAAA1B31007593840004',
        orderNumber: '1182/27.05.2024',
        packageCount: 2,
        weight: 6.0,
        cashOnDelivery: 250.00,
        status: 'livrat',
        packages: [
          { number: '1', weight: 3.0, dimensions: '30x30x30 cm' },
          { number: '2', weight: 3.0, dimensions: '30x30x30 cm' }
        ]
      }
    ];
  }

  getCourierLogo(courier: string): string {
    switch (courier.toLowerCase()) {
      case 'dpd': return 'assets/dpd-logo.png';
      case 'cargus': return 'assets/cargus-logo.png';
      case 'fan': return 'assets/fan-logo.png';
      case 'gls': return 'assets/gls-logo.png';
      case 'sameday': return 'assets/sameday-logo.png';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'awb generat': return 'status-awb-generat';
      case 'comanda trimisa': return 'status-comanda-trimisa';
      case 'neridicat': return 'status-neridicat';
      case 'intarziat': return 'status-intarziat';
      case 'livrat': return 'status-livrat';
      case 'anulat': return 'status-anulat';
      case 'inchis intern': return 'status-inchis-intern';
      default: return '';
    }
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
    // Handle view order logic
    this.router.navigate(['/order-details', order.awb]);
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
