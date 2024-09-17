// show.component.ts
import {Component, OnInit} from '@angular/core';
import {OrderData} from "../../../model/order-data";
import {ShipmentDetails} from "../../../model/shipmentDetails";
import {NgClass} from "@angular/common";
import {OrderService} from "../../../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {routes} from "../../../app-routing.module";

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
  order: OrderData;
  shipmentDetails: ShipmentDetails;


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
      (data: { order: OrderData; shipmentDetails: ShipmentDetails }) => {
        this.order = data.order;
        this.shipmentDetails = data.shipmentDetails;
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

