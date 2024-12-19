import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {FlatShipment} from "../../../model/flatShipment";
import {OrderService} from "../../../services/order.service";
import {PickupData} from "../../../services/pickupData";
import {DatePickerDialogComponent} from "../date-picker-dialog/date-picker-dialog.component";
import {ApiDownloadResponse} from "../courier-options/api-download.response";
import {filter} from "rxjs/operators";
import {DownloadService} from "../../../services/download.service";

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
  isSelected?: boolean; // Add this property
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
    DatePickerDialogComponent,
  ],
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  filteredOrders: FlatShipment[] = [];
  pages: number[] = []
  currentPage: number = 1;
  private readonly pageSize = 10;
  showDialog: boolean = false;
  private totalPages: number;

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
  private selectedOrders: FlatShipment[];

  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              private downloadService: DownloadService,
              private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.goToPage(1);
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
      return ''; // Return a default or empty string if courier is undefined or null
    }
    let clas = '';
    switch (status.toUpperCase()) {
      case 'AWB_GENERAT':
        clas = 'status-awb-generat';
        break;
      case 'COMANDA_TRIMISA':
        clas = 'status-comanda-trimisa';
        break;
      case 'AWB_RIDICAT':
        clas = 'status-ridicat';
        break;
      case 'TRANZIT':
        clas = 'status-in-tranzit';
        break;
      case 'IN_LIVRARE':
        clas = 'status-in-livrare';
        break;
      case 'LIVRAT':
        clas = 'status-livrat';
        break;
      case 'RAMBURSAT':
        clas = 'status-rambursat';//
        break;
      case 'RETURNARE':
        clas = 'status-clas = are';//
        break;
      case 'REDIRECTIONARE':
        clas = 'status-redirectionare';
        break;
      case 'EROARE':
        clas = 'status-eroare';
        break;
      default:
        clas = '';
        break;
    }
    return clas;
  }

  viewOrder(order: FlatShipment): void {
    const currentPath = this.router.url
    const basePath = currentPath.replace(/\/order-list$/, ''); // Remove /view from the end
    const targetPath = `${basePath}/track/${order.awb}`;
    this.router.navigate([targetPath]);
  }

  downloadOrder(order: FlatShipment): void {
    this.orderService.downloadLabel(order.awb).subscribe(
      response => {
        // Update order status or provide feedback
        this.downloadService.downloadLabel(response);
      },
      error => {
        console.error(`Failed to download label for order ${order.awb}.`, error);
      }
    );
    console.log('Downloaded label');
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.pages.length) {
      this.currentPage++;
      this.filterOrders();
    }
  }

  getVisiblePages(): (number | string)[] {
    const totalPages = this.getPagesArray();
    const maxVisible = 5; // Number of visible pages (excluding ellipses)
    const totalPageCount = totalPages.length;
    const visiblePages: (number | string)[] = [];

    if (totalPageCount <= maxVisible) {
      // If total pages are fewer than or equal to maxVisible, show all
      return totalPages;
    }

    // Always show the first page
    visiblePages.push(1);

    // Add ellipses if the current page is far from the start
    if (this.currentPage > Math.ceil(maxVisible / 2)) {
      visiblePages.push('...');
    }

    // Calculate the range of visible pages around the current page
    const startPage = Math.max(
      2,
      this.currentPage - Math.floor(maxVisible / 2) + 1
    );
    const endPage = Math.min(totalPageCount - 1, startPage + maxVisible - 2);

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    // Add ellipses if the current page is far from the end
    if (endPage < totalPageCount - 1) {
      visiblePages.push('...');
    }

    // Always show the last page
    visiblePages.push(totalPageCount);

    return visiblePages;
  }



  goToPage(page: number): void {
    this.currentPage = page;
    this.filterOrders();
  }

  filterOrders(): void {
    this.orderService.filterShipments(this.filter, this.currentPage - 1, 3).subscribe(
      (response) => {
        // Assuming response is an array of FlatShipment
        const data = response as FlatShipment[];
        this.filteredOrders = data;
        this.totalPages = data.length > 0 ? data[0].pages : 0;
        this.cdr.detectChanges(); // Update the view
      },
      error => {
        console.error('Error loading filtered shipments:', error);
      }
    );
  }

  // Method to handle filter input changes
  filterChange(): void {
    this.currentPage = 1; // Reset to first page
    this.filterOrders();
  }

  getPagesArray() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  requestCourierPickup(): void {
    const selectedOrders = this.filteredOrders.filter(order => order.isSelected);

    this.selectedOrders = selectedOrders

    if (selectedOrders.length === 0) {
      alert('Please select at least one order.');
      return;
    }

    // Proceed to show the date picker popup
    this.showDialog = true; // Show the custom dialog
  }


  exportExcel(): void {

  }


  onDialogConfirm(pickupDate: string): void {
    // Hide the dialog
    this.showDialog = false;


    // Format pickup date in Romanian locale for display in message
    const formattedDate = new Date(pickupDate).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Process each selected order
    this.selectedOrders.forEach(order => {
      const data: PickupData = { pickupDate };
      const courier = order.courier;
      const orderId = Number(order.orderNumber);

      this.orderService.pickupOrder(data, courier, orderId).subscribe(
        response => {
          order.status = 'COMANDA_TRIMISA';
          order.pickupDate = formattedDate;
          this.cdr.detectChanges(); // Ensure Angular updates the DOM
        },
        error => {
          alert("A aparut o eroare. Va rugam reincercati, sau contactati-ne. Ne vom ocupa imediat! :)");
          console.error(`Failed to schedule pickup for order ${order.awb}.`, error);
        },
        // Finalize after each request
        () => {

        }
      );
    });
  }
  onDialogCancel(): void {
    this.showDialog = false; // Hide the dialog
  }

  awbGenerat(status: string) {
    return status?.toUpperCase() === 'AWB_GENERAT';
  }
}
