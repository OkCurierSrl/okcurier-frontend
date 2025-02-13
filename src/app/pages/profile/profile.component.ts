import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Client} from "../../model/client";
import {AuthService} from "@auth0/auth0-angular";
import {ClientService} from "../../services/client.service";
import {AsyncPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  client: Client;
  clientType: string = 'fizica'; // default selection
  editMode: boolean = false;
  errorMessages: string[] = [];
  successMessage: string = '';

  constructor(protected auth: AuthService, private http: HttpClient, private clientService: ClientService) {
  }

  ngOnInit() { // Assume client is fetched from auth service (which includes billing_info)
    this.auth.user$.subscribe(user => {
      this.clientService.getClientByEmail(user.email).subscribe(
        (client: Client) => {
          this.client = client;
          if (this.client.billing_info && this.client.billing_info.company_name && this.client.billing_info.company_name !== 'None') {
            this.clientType = 'juridica';
          } else {
            this.clientType = 'fizica';
          }
          if (this.client.billing_info) {
            this.client.billing_info.clientType = this.clientType;
          }
        });
    });
  }

    toggleEditMode()
    {
      this.editMode = !this.editMode; // Clear any previous messages this.errorMessages = []; this.successMessage = ''; }

    }

    onClientTypeChange()
    {
      if (this.client.billing_info) {
        this.client.billing_info.clientType = this.clientType;
      }
    }

    saveProfile()
    { // Clear previous messages
      this.errorMessages = [];
      this.successMessage = '';
      // Basic front-end validations based on client type
      if (this.client.billing_info.clientType === 'juridica') {
        if (!this.client.billing_info.company_name || !this.client.billing_info.cui ||
          !this.client.billing_info.registration_number || !this.client.billing_info.iban) {
          this.errorMessages.push("Toate câmpurile pentru persoana juridica sunt obligatorii.");
          return;
        }
      } else if (this.client.billing_info.clientType === 'fizica') {
        if (!this.client.billing_info.firstName || !this.client.billing_info.lastName ||
          !this.client.billing_info.cnp || !this.client.billing_info.judet ||
          !this.client.billing_info.oras || !this.client.billing_info.adresa ||
          !this.client.billing_info.iban) {
          this.errorMessages.push("Toate câmpurile pentru persoana fizica sunt obligatorii.");
          return;
        }
      }

      this.clientService.modifyBillingInfo(this.client.email, this.client.billing_info)
        .subscribe({
          next: (response: any) => {
            this.successMessage = response.message || "Date salvate cu succes.";
            this.toggleEditMode();
          },
          error: (error) => {
            let errObj;
            if (error.error) {
              // If error.error is a string, try to parse it.
              if (typeof error.error === 'string') {
                try {
                  errObj = JSON.parse(error.error);
                } catch(e) {
                  errObj = error.error; // fallback if parsing fails
                }
              } else {
                errObj = error.error;
              }
              for (let key in errObj) {
                this.errorMessages.push(errObj[key]);
              }
            } else {
              this.errorMessages.push("A apărut o eroare la salvarea profilului.");
            }
          }
        });
    }

    logout()
    {
      this.auth.logout();
    }
}




