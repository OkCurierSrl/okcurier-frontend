import { Component, OnInit } from '@angular/core';
import {AuthService, User} from '@auth0/auth0-angular';
import { HighlightModule } from 'ngx-highlightjs';
import {FormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, NgIf, NgOptimizedImage} from "@angular/common";
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
  imports: [HighlightModule, FormsModule, AsyncPipe, DatePipe, NgOptimizedImage, NgIf],
})
export class ProfileComponent implements OnInit {
  profileJson: string = null;
  editMode: boolean = false;
  client: Client
  private email: string;

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
                discounts: [], email: "", id: 0,
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
    console.log(this.client.billing_info)
    const updatedBillingInfo = this.client.billing_info; // This object is updated automatically via [(ngModel)]

    // Save the updated billing info using the ClientService
    this.clientService.modifyBillingInfo(this.email, updatedBillingInfo).subscribe(
      () => {
        console.log('Billing information saved successfully.');
        this.editMode = false; // Exit edit mode after saving
      },
      (error) => {
        console.error('Error saving billing information', error);
      }
    );
  }
  logout() {
    this.auth.logout({ logoutParams: {returnTo: document.location.origin }});
  }

  test() {
      this.auth.getAccessTokenSilently().subscribe(
        token => {
          console.log(token);
          this.http.get<User>(`http://localhost:8080/api/test/user-info`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }).subscribe(
            (data: User) => console.log(data),
            err => console.error(err)
          );
        },
        err => {
          console.error('Failed to get token', err);
        }
      );
  }
}
