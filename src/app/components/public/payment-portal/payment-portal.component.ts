import { Component, AfterViewInit, OnInit } from '@angular/core';
import { StripeService } from '../../../services/stripe.service';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import {OrderData} from "../../../model/order-data";
import {OrderService} from "../../../services/order.service";
import {DownloadService} from "../../../services/download.service";

@Component({
  selector: 'app-payment-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-portal.component.html',
  styleUrls: ['./payment-portal.component.css'],
})
export class PaymentPortalComponent implements OnInit, AfterViewInit {
  card: any;
  stripe: any;
  elements: any;
  error: string | null = null;

  amount: number = 0;
  description: string = '';
  stripeInitialized: boolean = false;
  email: string;
  courier: string;
  orderData: OrderData;

  constructor(private stripeService: StripeService,
              private route: ActivatedRoute,
              private router: Router,
              private downloadService: DownloadService,
              private orderService: OrderService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.stripeService.initializeStripe(environment.stripe.publicKey);
      this.stripe = this.stripeService.getStripe();
      if (!this.stripe) {
        throw new Error('Stripe initialization failed');
      }
      this.stripeInitialized = true;
      // Get query parameters
      this.route.queryParams.subscribe((params) => {
        this.amount = +params['amount'] || 0;
        this.description = params['description'] || 'Default description';
        this.email = params['email'] || 'default email';
        this.orderData = params['orderData'];
        this.courier = params['courier'];
      });
    } catch (error) {
      console.error('Error during Stripe initialization:', error);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Wait until Stripe is initialized
    if (!this.stripeInitialized) {
      const interval = setInterval(() => {
        if (this.stripe) {
          clearInterval(interval);
          this.createCardElement();
        }
      }, 100); // Retry every 100ms until initialized
      return;
    }
    this.createCardElement();
  }

  private createCardElement(): void {
    if (!this.stripe) {
      return;
    }
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');

    this.card.on('change', (event: any) => {
      this.error = event.error ? event.error.message : null;
    });
  }

  async handlePayment(): Promise<void> {
    try {
      const response = await this.stripeService.createPaymentIntent(this.amount, this.email, 'ron');
      const clientSecret = response.clientSecret;

      const { error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
        },
      });

      if (error) {
        this.error = error.message;
      } else {
        const currentUrl = this.router.url;
        let paymentRoute: string;
        if (currentUrl.startsWith('/dashboard')) {
          paymentRoute = '/dashboard/track/';
        } else if (currentUrl.startsWith('/admin')) {
          paymentRoute = '/admin/track/';
        } else {
          paymentRoute = '/track/';
        }
        console.log("placing order...")

        this.orderService.placeOrder(this.orderData, this.courier, true).subscribe({
          next: (response) => {
            // Navigate to confirmation page
            this.downloadService.downloadLabel(response);
            paymentRoute = paymentRoute + response.awb
            this.router.navigate([paymentRoute]);
          },
          error: (error) => {
            alert("A aparut o eroare necunoscuta, va rugam incercati din nou")
            console.error('Error generating AWB:', error);
          },
          complete: () => {
            console.log('AWB generation completed');
          },
        });

      }
    } catch (err) {
      this.error = 'An error occurred during payment processing. Please try again.';
      console.error(err);
      alert(err);
    }
  }
}
