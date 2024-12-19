import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {OrderData} from 'src/app/model/order-data';
import {DecimalPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.css'],
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    NgForOf,
    DecimalPipe
  ]
})
export class PaymentConfirmationComponent implements OnInit {
  orderData: OrderData = null; // Use 'any' for flexibility (replace with a proper interface if needed)
  courier: string = '';
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      try {
        const rawData = params['orderData'];
        console.log('Raw Query Param:', rawData);

        // First parse to remove the outer string
        const parsedOnce = JSON.parse(rawData);
        console.log('After First Parse:', parsedOnce);

        // Second parse if needed
        const parsedData = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
        console.log('Parsed Order Data:', parsedData);

        console.log('Parsed Expeditor:', parsedData?.expeditor);

        // Assign data to component properties
        this.orderData = parsedData;
        this.courier = params['courier'] || '';
      } catch (error) {
        console.error('Error parsing order data:', error);
      } finally {
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }
}
