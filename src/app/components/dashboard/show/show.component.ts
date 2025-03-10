// show.component.ts
import {Component, OnInit} from '@angular/core';
import {OrderData} from "../../../model/order-data";
import {ShipmentDetails} from "../../../model/shipmentDetails";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {routes} from "../../../app-routing.module";
import {FlatShipment} from "../../../model/flatShipment";
import {Address} from "../../../model/address";
import {ExpandOperator} from "rxjs/internal/operators/expand";

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
  sender: Address | null;
  receiver: Address | null;
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
export class ShowComponent implements OnInit {
  shipment: Shipment;
  apiParcelResponse: ApiParcelResponse;
  iban: string;


  constructor(private orderService: OrderService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('lalalalalalalal')
    // Get the AWB from the route parameters
    this.route.paramMap.subscribe(params => {
      const awb = params.get('awb');
        this.fetchOrderDetails(awb); // Fetch order details using AWB
    });
    console.log('lalalalalalalal')
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

