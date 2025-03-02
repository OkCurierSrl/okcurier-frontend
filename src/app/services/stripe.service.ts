import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {OrderData} from "../model/order-data";

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: Stripe | null = null;
  private apiUrl = environment.apiUrl;  // Update with your API base URL

  constructor(private http: HttpClient) {}

  async initializeStripe(publishableKey: string): Promise<void> {
    if (this.stripe) {
      console.log('Stripe is already initialized');
      return;
    }

    try {
      console.log('Initializing Stripe...');
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
        return;
      }
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      throw error;
    }
  }

  getStripe(): Stripe | null {
    return this.stripe;
  }

  async createPaymentIntent(amount: number, email:string, currency: string): Promise<{ clientSecret: string, invoiceUrl: string }> {
    // Call the backend to create a payment intent
    return this.http
      .post<{ clientSecret: string, invoiceUrl: string }>(this.apiUrl + '/api/payments/create-payment-intent', {
        amount,
        email,
        currency
      })
      .toPromise();
  }

  async confirmCardPayment(clientSecret: string, cardElement: any): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    // Confirm the payment using the client secret and card details
    return this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
  }

  sendConfirmationEmail(request: {
    amount: number;
    courier: string;
    invoiceUrl: string;
    orderData: OrderData; // Keep as OrderData type
    awb: string;
    email: string
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payments/send-confirmation`, request);
  }

}
