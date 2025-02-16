import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CalendarModule } from "primeng/calendar";
import { FlatShipment } from "../../../model/flatShipment";
import { OrderService } from "../../../services/order.service";
import { PickupData } from "../../../services/pickupData";
import { DatePickerDialogComponent } from "../date-picker-dialog/date-picker-dialog.component";
import { DownloadService } from "../../../services/download.service";

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
  pages: number[] = [];
  currentPage: number = 1;
  private readonly pageSize = 10;
  showDialog: boolean = false;
  private totalPages: number;
  isLoading: boolean = false; // loading flag
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
              private orderService: OrderService) {}

  ngOnInit(): void {
    this.goToPage(1);
  }

  getCourierLogo(courier: string | undefined): string {
    if (!courier) return '';
    switch (courier.toLowerCase()) {
      case 'dpd': return 'assets/dpd-logo.png';
      case 'cargus': return 'assets/cargus-logo.png';
      case 'gls': return 'assets/gls-logo.png';
      case 'sameday': return 'assets/sameday-logo.png';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    let clas = '';
    switch (status.toUpperCase()) {
      case 'AWB_GENERAT': clas = 'status-awb-generat'; break;
      case 'COMANDA_TRIMISA': clas = 'status-comanda-trimisa'; break;
      case 'AWB_RIDICAT': clas = 'status-ridicat'; break;
      case 'TRANZIT': clas = 'status-in-tranzit'; break;
      case 'IN_LIVRARE': clas = 'status-in-livrare'; break;
      case 'LIVRAT': clas = 'status-livrat'; break;
      case 'RAMBURSAT': clas = 'status-rambursat'; break;
      case 'RETURNARE': clas = 'status-returnare'; break;
      case 'REDIRECTIONARE': clas = 'status-redirectionare'; break;
      case 'EROARE': clas = 'status-eroare'; break;
      default: clas = ''; break;
    }
    return clas;
  }

  viewOrder(order: FlatShipment): void {
    const currentPath = this.router.url;
    const basePath = currentPath.replace(/\/order-list$/, '');
    const targetPath = `${basePath}/track/${order.awb}`;
    this.router.navigate([targetPath]);
  }

  downloadOrder(order: FlatShipment): void {
    this.orderService.downloadLabel(order.awb).subscribe(
      response => { this.downloadService.downloadLabel(response); },
      error => { console.error(`Failed to download label for order ${order.awb}.`, error); }
    );
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
    const maxVisible = 5;
    const totalPageCount = totalPages.length;
    const visiblePages: (number | string)[] = [];

    if (totalPageCount <= maxVisible) return totalPages;
    visiblePages.push(1);
    if (this.currentPage > Math.ceil(maxVisible / 2)) visiblePages.push('...');
    const startPage = Math.max(2, this.currentPage - Math.floor(maxVisible / 2) + 1);
    const endPage = Math.min(totalPageCount - 1, startPage + maxVisible - 2);
    for (let i = startPage; i <= endPage; i++) { visiblePages.push(i); }
    if (endPage < totalPageCount - 1) visiblePages.push('...');
    visiblePages.push(totalPageCount);
    return visiblePages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.filterOrders();
  }

  filterOrders(): void {
    this.isLoading = true;
    this.orderService.filterShipments(this.filter, this.currentPage - 1, 3).subscribe(
      (response) => {
        const data = response as FlatShipment[];
        this.filteredOrders = data;
        this.totalPages = data.length > 0 ? data[0].pages : 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error loading filtered shipments:', error);
        this.isLoading = false;
      }
    );
  }

  filterChange(): void {
    this.currentPage = 1;
    this.filterOrders();
  }

  getPagesArray() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  requestCourierPickup(): void {
    const selectedOrders = this.filteredOrders.filter(order => order.isSelected);
    this.selectedOrders = selectedOrders;
    if (selectedOrders.length === 0) {
      alert('Please select at least one order.');
      return;
    }
    this.showDialog = true;
  }

  exportExcel(): void {
    // Implement export functionality here
  }

  onDialogConfirm(pickupDate: string): void {
    this.showDialog = false;
    const formattedDate = new Date(pickupDate).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.isLoading = true;
    this.selectedOrders.forEach(order => {
      const data: PickupData = { pickupDate };
      const courier = order.courier;
      const orderId = Number(order.orderNumber);
      this.orderService.pickupOrder(data, courier, orderId).subscribe(
        response => {
          order.status = 'COMANDA_TRIMISA';
          order.pickupDate = formattedDate;
          this.cdr.detectChanges();
        },
        error => {
          alert("A apărut o eroare. Vă rugăm încercați din nou sau contactați-ne.");
          console.error(`Failed to schedule pickup for order ${order.awb}.`, error);
        },
        () => {
          this.isLoading = false;
        }
      );
    });
  }

  onDialogCancel(): void {
    this.showDialog = false;
  }

  awbGenerat(status: string): boolean {
    return status?.toUpperCase() === 'AWB_GENERAT';
  }
}
