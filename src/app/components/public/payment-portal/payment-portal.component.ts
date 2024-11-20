import { Component, AfterViewInit, OnInit } from '@angular/core';
import { StripeService } from '../../../services/stripe.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

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
  private email: string;

  constructor(private stripeService: StripeService, private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    try {
      console.log('Initializing Stripe...');
      await this.stripeService.initializeStripe(environment.stripe.publicKey);

      this.stripe = this.stripeService.getStripe();
      console.log('Stripe instance:', this.stripe);

      if (!this.stripe) {
        throw new Error('Stripe initialization failed');
      }

      this.stripeInitialized = true;

      // Get query parameters
      this.route.queryParams.subscribe((params) => {
        this.amount = +params['amount'] || 0;
        this.description = params['description'] || 'Default description';
        this.email = params['email'] || 'default email';
      });
    } catch (error) {
      console.error('Error during Stripe initialization:', error);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Wait until Stripe is initialized
    if (!this.stripeInitialized) {
      console.warn('Stripe is not initialized yet. Retrying...');
      const interval = setInterval(() => {
        if (this.stripe) {
          clearInterval(interval);
          this.createCardElement();
        }
      }, 100); // Retry every 100ms until initialized
      return;
    }

    // Create card element immediately if already initialized
    this.createCardElement();
  }

  private createCardElement(): void {
    if (!this.stripe) {
      console.error('Stripe is still not initialized');
      return;
    }

    console.log('Creating Stripe elements...');
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');

    this.card.on('change', (event: any) => {
      this.error = event.error ? event.error.message : null;
    });

    console.log('Card element mounted successfully');
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
        alert('Payment successful! An invoice will be sent to your email.');
      }
    } catch (err) {
      this.error = 'An error occurred during payment processing. Please try again.';
      console.error(err);
    }
  }
}
