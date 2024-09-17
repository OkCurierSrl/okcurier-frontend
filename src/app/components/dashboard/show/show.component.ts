// show.component.ts
import {Component, OnInit} from '@angular/core';
import {OrderData} from "../../../model/order-data";
import {ShipmentDetails} from "../../../model/shipmentDetails";
import {NgClass} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {routes} from "../../../app-routing.module";
import {FlatShipment} from "../../../model/flatShipment";
import {Address} from "../../../model/address";
import {ExpandOperator} from "rxjs/internal/operators/expand";

export interface TrackingResponse {
  shipment: Shipment;
  parcels: ApiParcelResponse;
  iban: ApiParcelResponse;
}

export interface Shipment {
  id: number; // Assuming the ID is always present when used
  // General Information

  awb: string | null;
  curier: string | null;
  orderNumber: number | null;
  numberOfParcels: number | null;
  totalWeight: number | null;
  iban: string;

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
  parcelsStatus: ParcelGenericStatus[]; // Array of ParcelGenericStatus
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
    NgClass
  ],
  styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {
  shipment: Shipment;
  shipmentDetails: ApiParcelResponse;


  constructor(private orderService: OrderService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the AWB from the route parameters
    this.route.paramMap.subscribe(params => {
      const awb = params.get('awb');
      if (awb) {
        this.fetchOrderDetails(awb); // Fetch order details using AWB
      }
      else {
        console.log("mock data provided")
      }
    });
  }

  fetchOrderDetails(awb: string): void {
    // Fetch the order and shipment details based on the AWB number
    this.orderService.trackOrder(awb).subscribe(
      (data) => {
        this.shipment = data.shipment;
        this.shipmentDetails = data.parcels;
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


  // order: OrderData = {
  //   expeditor: {
  //     shortName: 'Expeditor',
  //     name: 'Florin',
  //     phone1: '0786860450',
  //     phone2: '0768741081',
  //     county: 'Bucuresti',
  //     city: 'Bucuresti',
  //     street: 'Camil Ressu',
  //     number: '33',
  //     block: 'n4',
  //     staircase: '2',
  //     floor: '9',
  //     postalCode: '012345'
  //   },
  //   destinatar: {
  //     shortName: 'Destinatar',
  //     name: 'Fulea Adrian',
  //     phone1: '0747782423',
  //     county: 'Mehedinti',
  //     city: 'Dobra',
  //     street: 'Principala',
  //     number: '1',
  //     postalCode: '678912'
  //   },
  //   packages: [],
  //   extraServices: {
  //     deschidereColet: true,
  //     rambursCont: 29.75
  //   },
  //   isPlicSelected: false,
  //   price: 23.32,
  //   pickupDate: undefined,
  // };
  //
  // shipmentDetails: ShipmentDetails = {
  //   statusDate: "2024-02-05",
  //   status: "Tranzit",
  //   awb: "1071589994",
  //   deliveryDate: "2024-02-05",
  //   courier: "Cargus",
  //   iban: "RO29PORL1876996576376282"
  // }
}

