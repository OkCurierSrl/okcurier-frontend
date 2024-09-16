// show.component.ts
import {Component, OnInit} from '@angular/core';
import {OrderData} from "../../../model/order-data";
import {ShipmentDetails} from "../../../model/shipmentDetails";
import {NgClass} from "@angular/common";
import {OrderService} from "../../../services/order.service";

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


  constructor(private orderService: OrderService) {
    // this.order = orderService.trackOrder()// subscribe...
    // this.shippmentDetails = orderService.trackOrder()
  }

  ngOnInit(): void {
      throw new Error('Method not implemented.');
  }
  order: OrderData = {
    expeditor: {
      shortName: 'Expeditor',
      name: 'Florin',
      phone1: '0786860450',
      phone2: '0768741081',
      county: 'Bucuresti',
      city: 'Bucuresti',
      street: 'Camil Ressu',
      number: '33',
      block: 'n4',
      staircase: '2',
      floor: '9',
      postalCode: '012345'
    },
    destinatar: {
      shortName: 'Destinatar',
      name: 'Fulea Adrian',
      phone1: '0747782423',
      county: 'Mehedinti',
      city: 'Dobra',
      street: 'Principala',
      number: '1',
      postalCode: '678912'
    },
    packages: [],
    extraServices: {
      deschidereColet: true,
      rambursCont: 29.75
    },
    isPlicSelected: false,
  };

  shippmentDetails: ShipmentDetails = {
    status: "Tranzit",
    awb: "1071589994",
    deliveryDate: "2024-02-05",
    pickupDate: "2024-02-03",
    courier: "Cargus",
    deliveryCost: 23.32,
    iban: "RO29PORL1876996576376282"
  }
}

