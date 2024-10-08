import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService, User} from '@auth0/auth0-angular';
import { HighlightModule } from 'ngx-highlightjs';
import {FormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {auth} from "express-oauth2-jwt-bearer";
import {Client} from "../../model/client";
import {ClientService} from "../../services/client.service";
import {BillingInfo} from "../../model/billingInfo";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [HighlightModule, FormsModule, AsyncPipe, DatePipe, NgOptimizedImage, NgIf, NgForOf],
})
export class ProfileComponent implements OnInit {
  profileJson: string = null;
  editMode: boolean = false;
  client: Client
  private email: string;
  errorMessage: string = null;
  protected errorMessages: any[];

  constructor(public auth: AuthService,
              private clientService: ClientService,
              private http: HttpClient) {}

  ngOnInit() {
    this.auth.user$.subscribe(
      (profile) => {
        this.email = profile.email;
        this.profileJson = JSON.stringify(profile, null, 2);
        this.clientService.getClientByEmail(profile.email).subscribe(
          (client: Client) => {
            this.client = client;
            // Initialize billing_info if it's undefined
            if (!this.client.billing_info) {
              this.client.billing_info = {
                name: "",
                discounts: null,
                email: "", id: 0,
                company_name: '',
                cui: '',
                registration_number: '',
                phone_number: '',
                iban: '',
                contract_number: ''
              };
            }
          },
          error => {
            console.error('Error fetching client data', error);
          }
        );
      }
    );
  }


  saveProfile() {
    if (!this.client || !this.client.billing_info) {
      console.error('No client or billing information available to save.');
      return;
    }

    const updatedBillingInfo = this.client.billing_info;

    this.clientService.modifyBillingInfo(this.email, updatedBillingInfo).subscribe(
      () => {
        console.log('Billing information saved successfully.');
        this.editMode = false; // Exit edit mode after saving
        this.errorMessages = null; // Clear previous errors
      },
      (error) => {
        console.error('Error saving billing information', error);

        if (error.status === 400 && error.error) {
          // Parse the error message which is in JSON format
          try {
            const errorResponse = JSON.parse(error.error); // Parse the JSON string
            this.errorMessages = [];

            // Extract each validation error
            for (const [field, message] of Object.entries(errorResponse)) {
              this.errorMessages.push(`${field}: ${message}`);
            }
          } catch (e) {
            this.errorMessages = ['Invalid input. Please check your details.'];
          }
        } else {
          this.errorMessages = ['An unexpected error occurred. Please try again later.'];
        }
      }
    );
  }


  logout() {
    this.auth.logout({ logoutParams: {returnTo: document.location.origin }});
  }
}
