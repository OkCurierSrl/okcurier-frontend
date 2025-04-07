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
  email: string = '';
  courier: string = '';
  orderData: OrderData;
  isLoading: boolean = false;
  isDisabled: boolean = false;

  constructor(
    private stripeService: StripeService,
    private router: Router,
    private downloadService: DownloadService,
    private orderService: OrderService
  ) {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      this.amount = state.amount;
      this.email = state.email;
      this.courier = state.courier;
      this.orderData = state.orderData;
      this.description = state.description || 'Default description';
    } else {
      // Redirect to home if no state data
      this.router.navigate(['/']);
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.stripeService.initializeStripe(environment.stripe.publicKey);
      this.stripe = this.stripeService.getStripe();
      if (!this.stripe) {
        throw new Error('Stripe initialization failed');
      }
      this.stripeInitialized = true;
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
    this.isLoading = true;
    this.isDisabled = true;
    try {
      const paymentIntentResponse = await this.stripeService.createPaymentIntent(
        this.amount,
        this.email,
        'ron'
      );
      const clientSecret = paymentIntentResponse.clientSecret;
      const invoiceUrl = paymentIntentResponse.invoiceUrl;

      const { error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.card },
      });

      if (error) {
        this.error = error.message;
        this.isLoading = false;
      } else {
        // Determine the correct payment route based on current URL
        const currentUrl = this.router.url;
        let paymentRoute: string;
        if (currentUrl.startsWith('/dashboard')) {
          paymentRoute = '/dashboard/track/';
        } else if (currentUrl.startsWith('/admin')) {
          paymentRoute = '/admin/track/';
        } else {
          paymentRoute = '/track/';
        }

        this.orderService.placeOrder(this.orderData, this.courier, true).subscribe({
          next: (response) => {
            this.sendConfirmationEmail(response.awb, invoiceUrl);

            // Navigate using state
            this.router.navigate([paymentRoute + response.awb]);

            setTimeout(() => {
              this.downloadService.downloadLabel(response, this.courier, response.awb);
            }, 0);
          },
          error: (error) => {
            alert("A apărut o eroare necunoscută, vă rugăm încercați din nou");
            console.error('Error generating AWB:', error);
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
            console.log('AWB generation completed');
          },
        });
      }
    } catch (err) {
      this.error = 'An error occurred during payment processing. Please try again.';
      console.error(err);
      alert(err);
      this.isLoading = false;
    }
  }

  private sendConfirmationEmail(awb: string, invoiceUrl: string): void {
    this.stripeService.sendConfirmationEmail({
      email: this.email,
      awb: awb,
      invoiceUrl: invoiceUrl,
      amount: this.amount,
      orderData: this.orderData,
      courier: this.courier,
    }).subscribe({
      error: (error) => {
        console.error('Error sending confirmation email:', error);
      }
    });
  }
}
