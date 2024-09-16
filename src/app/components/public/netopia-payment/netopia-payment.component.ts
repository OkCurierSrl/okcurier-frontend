import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {CourierOption} from "../../../model/courier.option";
import {OrderData} from "../../../model/order-data";

@Component({
  selector: 'app-netopia-payment',
  templateUrl: './netopia-payment.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./netopia-payment.component.css']
})
export class NetopiaComponent implements OnInit {
  selectedCourier: CourierOption;
  orderData: OrderData;
  envKey: string;
  paymentData: string;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.selectedCourier = navigation?.extras?.state?.['selectedCourier'] as CourierOption;
    console.log(typeof this.selectedCourier); // Should log 'object'

    this.orderData = navigation?.extras?.state?.['orderData'];
  }

  ngOnInit(): void {
    if (this.selectedCourier) {
      console.log(this.selectedCourier.courier);
      console.log(this.selectedCourier.totalPrice);
    } else {
      console.error('selectedCourier is undefined');
    }

  }

  initializePayment(): void {
    // Simulating API call to get envKey and paymentData
    // In a real scenario, this should be done by making an HTTP call to your backend
    this.envKey = 'your-env-key'; // Replace with actual envKey from backend
    this.paymentData = 'your-payment-data'; // Replace with actual encrypted payment data from backend
  }

  processPayment(): void {
    console.log('Processing payment with Netopia:', this.selectedCourier);
    console.log('Processing payment with Netopia:', this.orderData);

    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://secure.mobilpay.ro');

    // Create hidden input elements for env_key and data
    const envKeyInput = document.createElement('input');
    envKeyInput.setAttribute('type', 'hidden');
    envKeyInput.setAttribute('name', 'env_key');
    envKeyInput.setAttribute('value', this.envKey);

    const dataInput = document.createElement('input');
    dataInput.setAttribute('type', 'hidden');
    dataInput.setAttribute('name', 'data');
    dataInput.setAttribute('value', this.paymentData);

    // Append inputs to form
    form.appendChild(envKeyInput);
    form.appendChild(dataInput);

    // Append form to the body and submit
    document.body.appendChild(form);
    form.submit();
  }
}
