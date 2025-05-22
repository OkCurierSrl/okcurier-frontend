// show.component.ts
import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Contact} from "../../../model/contact";
import {MetaTagService} from "../../../services/meta-tag.service";

export interface TrackingResponse {
  shipmentData: Shipment;
  parcelData: ApiParcelResponse;
  iban: string;
}

export interface Shipment {
  id: number; // Assuming the ID is always present when used
  // General Information

  awb: string | null;
  curier: string | null;
  orderNumber: number | null;
  numberOfParcels: number | null;
  totalWeight: number | null;

  // Prices
  appPrice: number | null;
  codPrice: number | null;
  insurancePrice: number | null;

  // Dates
  creationDate: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;

  // Extra Services
  codToAccount: boolean | null;
  insurance: boolean | null;
  transportIncluded: boolean | null;
  parcelOpening: boolean | null;
  parcelExchange: boolean | null;
  documentExchange: boolean | null;
  returnUnDeliveredParcel: boolean | null;

  // Sender and Receiver
  sender: Contact | null;
  receiver: Contact | null;
}

export interface ApiParcelResponse {
  parcelGenericStatuses: ParcelGenericStatus[]; // Array of ParcelGenericStatus
}

// parcel-generic-status.model.ts
export interface ParcelGenericStatus {
  parcelIdentifier: string | null;
  status: string | null;
  description: string | null;
  date: string | null;
}


// Example PackageType Enum (Adjust based on your application's needs)

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    DatePipe
  ],
  styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit, OnDestroy {
  shipment: Shipment;
  apiParcelResponse: ApiParcelResponse;
  iban: string;


  constructor(private orderService: OrderService,
              private router: Router,
              private route: ActivatedRoute,
              private metaTagService: MetaTagService) {}

  ngOnInit(): void {
    // Set noindex meta tag for tracking pages
    this.metaTagService.setNoIndexForTrackingPage();

    // Get the AWB from the route parameters
    this.route.paramMap.subscribe(params => {
      const awb = params.get('awb');
        this.fetchOrderDetails(awb); // Fetch order details using AWB
    });
  }

  ngOnDestroy(): void {
    // Reset meta tags when component is destroyed (if needed)
    this.metaTagService.resetMetaTags();
  }

  fetchOrderDetails(awb: string): void {
    // Fetch the order and shipment details based on the AWB number
    this.orderService.trackOrder(awb).subscribe(
      (data) => {
        this.shipment = data.shipmentData;
        console.log(data)
        this.apiParcelResponse = data.parcelData;
        this.iban = data.iban;
      },
      error => {
        console.error('Error fetching order details:', error);
        // Navigate back with state data, specifying that an error occurred
        this.router.navigate(['..'], {
          relativeTo: this.route,
          state: { error: true },
        });
      }
    );
  }

}

