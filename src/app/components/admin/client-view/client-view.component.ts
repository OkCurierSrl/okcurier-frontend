import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {Discount} from "../../../model/discount";
import {ClientService} from "../../../services/client.service";
import {Client} from "../../../model/client"; // Define an interface matching the backend Discount class

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./client-view.component.css']
})
export class ClientViewComponent implements OnInit {
  clientName: string = '';
  email: string = '';
  discounts: Discount[] = [];
  modified: boolean = false;
  activeTab: string = 'info'; // Default tab
  client: Client;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      console.log(email)
      if (email) {
        this.clientService.getClientByEmail(email).subscribe(
          (client: Client) => {
            this.client = client;
            this.clientName = client.name;
            this.discounts = client.billing_info.discounts
          },
          error => {
            console.error('Error fetching client data', error);
            // Handle error case, e.g., show a notification to the user
          }
        );
      }
    });
  }
  markAsModified(): void {
    this.modified = true;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }


  saveDiscounts(): void {
    if (this.modified) {
      console.log(this.email)
      console.log(this.client.email)
      this.clientService.modifyDiscounts(this.client.email, this.discounts).subscribe(
        () => {
          alert('Discounts saved successfully.');
          this.modified = false;
        },
        (error) => {
          console.error('Error saving discounts', error);
        }
      );
    }
  }
}
