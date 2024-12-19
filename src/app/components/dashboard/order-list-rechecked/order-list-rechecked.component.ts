import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {FlatShipment} from "../../../model/flatShipment";
import {OrderService} from "../../../services/order.service";
import {PickupData} from "../../../services/pickupData";
import {DatePickerDialogComponent} from "../date-picker-dialog/date-picker-dialog.component";
import {DownloadService} from "../../../services/download.service";

@Component({
  selector: 'app-order-list',
  templateUrl: 'order-list-rechecked.component.html',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    CalendarModule,
    NgIf,
    NgForOf,
    DatePickerDialogComponent,
  ],
  styleUrls: ['./order-list-rechecked.component.css']
})
export class OrderListRecheckedComponent implements OnInit {
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
    weightRechecked: '',
    extraPriceWeighRecheck: '',
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


  goToPage(page: number): void {
    this.currentPage = page;
    this.filterOrders();
  }

  filterOrders(): void {
    this.orderService.filterShipmentsRechecked(this.filter, this.currentPage - 1, 3).subscribe(
      (response) => {
        // Assuming response is an array of FlatShipment
        const data = response as FlatShipment[];
        this.filteredOrders = data;
        this.totalPages = data.length > 0 ? data[0].pages : 0;
        console.log(this.filteredOrders)
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
    this.showDialog = false; // Hide the dialog

    // Process the selected orders with the selected date
    this.selectedOrders.forEach(order => {
      const data: PickupData = {pickupDate};
      const courier = order.courier;
      const orderId = Number(order.orderNumber);

      this.orderService.pickupOrder(data, courier, orderId).subscribe(
        response => {
          console.log(`Order ${order.awb} pickup scheduled successfully.`);
          // Update order status or provide feedback
        },
        error => {
          console.error(`Failed to schedule pickup for order ${order.awb}.`, error);
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
