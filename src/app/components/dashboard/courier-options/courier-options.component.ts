import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {AuthService} from "@auth0/auth0-angular";
import {CourierOption} from "../../../model/courier.option";
import {OrderData} from "../../../model/order-data";
import {ApiGenerateResponse} from "./api-generate.response";

@Component({
  selector: 'app-courier-options',
  templateUrl: './courier-options.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  styleUrls: ['./courier-options.component.css']
})
export class CourierOptionsComponent implements OnInit {
  couriers: CourierOption[] = [];
  private orderData: OrderData;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['couriers']) {
        this.couriers = JSON.parse(params['couriers']);
      }

      if (params['orderData']) {
        this.orderData = JSON.parse(params['orderData']);
        console.log(this.orderData + ' Order Data');
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
      case 'fan': return 'assets/fan-logo.png';
      default: return '';
    }
  }

  generateAWB(): void {
    this.callBackendWithPickup(false);
  }

  orderCourier(): void {
    this.callBackendWithPickup(true);
  }

  private callBackendWithPickup(pickup: boolean) {
    const selectedCourier = this.couriers.find(courier => courier.selected);
    if (!selectedCourier) {
      console.error('No courier selected');
      return;
    }
    this.orderService.placeOrder(this.orderData, selectedCourier.courier, pickup).subscribe({
      next: (response) => {
        console.log('AWB generated successfully:', response);

        this.downloadLabel(response);

        this.router.navigate(['/dashboard/order-list']); // Redirect to order list
      },
      error: (error) => {
        console.error('Error generating AWB:', error);
      },
      complete: () => {
        console.log('AWB generation completed');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/order']);
  }

  private downloadLabel(response: ApiGenerateResponse): void {
    const labelData = response.label;

    console.log(response)
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

}
