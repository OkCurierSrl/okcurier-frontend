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
        this.downloadLabel(response);
      },
      error => {
        console.error(`Failed to download label for order ${order.awb}.`, error);
      }
    );
    console.log('Downloaded label');
  }
  private downloadLabel(response: ApiDownloadResponse): void {
    const labelData = response.label;

    if (!labelData) {
      console.error('No label data found in the response.');
      return;
    }

    let labelBlob: Blob;

    // Check the type of labelData
    if (typeof labelData === 'string') {
      // If labelData is a base64 string
      labelBlob = this.base64ToBlob(labelData, 'application/pdf');
    } else if (labelData instanceof Array) {
      // If labelData is an array of numbers
      const byteArray = new Uint8Array(labelData);
      labelBlob = new Blob([byteArray], { type: 'application/pdf' });
    } else {
      console.error('Unexpected label format:', typeof labelData);
      return;
    }

    // Create a URL for the Blob
    const blobUrl = URL.createObjectURL(labelBlob);

    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'label.pdf'; // You can set a dynamic filename if needed
    link.click();

    // Clean up
    URL.revokeObjectURL(blobUrl);
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
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

    // Create the base message
    let clientMessage = `Programarea pentru preluare pe data de ${formattedDate} a fost realizată pentru următoarele comenzi:\n`;

    // Lists to collect successful and failed orders
    const successfulOrders: string[] = [];
    const failedOrders: string[] = [];

    // Process each selected order
    let processedOrders = 0; // Tracks the number of processed orders
    this.selectedOrders.forEach(order => {
      const data: PickupData = { pickupDate };
      const courier = order.courier;
      const orderId = Number(order.orderNumber);

      this.orderService.pickupOrder(data, courier, orderId).subscribe(
        // On success
        response => {
          console.log(`Order ${order.awb} pickup scheduled successfully.`);
          successfulOrders.push(`- AWB: ${order.awb}, livrat de: ${courier}`);
        },

        // On error
        error => {
          console.error(`Failed to schedule pickup for order ${order.awb}.`, error);
          failedOrders.push(`- AWB: ${order.awb}`);
        },

        // Finalize after each request
        () => {
          processedOrders++;

          // Finalize when all orders are processed
          if (processedOrders === this.selectedOrders.length) {
            // If there are successful pickups
            if (successfulOrders.length > 0) {
              clientMessage += successfulOrders.join('\n') + '\n';
            }

            // If there are failed pickups
            if (failedOrders.length > 0) {
              clientMessage += `Eroare la programare pentru:\n` + failedOrders.join('\n');
            }

            // Show a simple alert dialog for the final message
            alert(clientMessage);
          }
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
