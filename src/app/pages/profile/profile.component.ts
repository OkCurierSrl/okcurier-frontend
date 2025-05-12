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
  infoMessage: string = '';

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
            this.client.billing_info.client_type = this.clientType;
          }
        });
    });
  }

    toggleEditMode()
    {
      this.editMode = !this.editMode; // Clear any previous messages
      this.errorMessages = [];
      this.infoMessage = '';

      // If entering edit mode, clear all 'None' values to make it easier for the user
      if (this.editMode && this.client?.billing_info) {
        const fieldsToCheck = [
          'company_name', 'cui', 'registration_number', 'iban', 'phone_number', 'iban_name',
          'first_name', 'last_name', 'cnp', 'judet', 'oras', 'adresa'
        ];

        fieldsToCheck.forEach(field => {
          if (this.client.billing_info[field] === 'None') {
            this.client.billing_info[field] = '';
          }
        });
      }
    }

    onClientTypeChange()
    {
      if (this.client.billing_info) {
        this.client.billing_info.client_type = this.clientType;
      }
    }

     saveProfile() {
      this.errorMessages = [];
      this.successMessage = '';

      // Create billingInfoToSend at the top level
      const billingInfoToSend = {
        ...this.client.billing_info,
        // Remove camelCase versions
        clientType: undefined,
        companyName: undefined,
        contractNumber: undefined,
        phoneNumber: undefined,
        registrationNumber: undefined,
        ibanName: undefined,
        firstName: undefined,
        lastName: undefined
      };

      // Validate phone number format for both types
      const phoneRegex = /^07\d{8}$/;
      if (!phoneRegex.test(billingInfoToSend.phone_number)) {
        this.errorMessages.push("Numărul de telefon trebuie să înceapă cu 07 și să conțină 10 cifre.");
        return;
      }

      if (this.client.billing_info.client_type === 'juridica') {
        // Reset personal fields for company
        billingInfoToSend.first_name = 'None';
        billingInfoToSend.last_name = 'None';
        billingInfoToSend.cnp = 'None';

        // Validate company fields
        if (!billingInfoToSend.company_name ||
            !billingInfoToSend.cui ||
            !billingInfoToSend.registration_number ||
            // iban si nume iban sunt optionale
            !billingInfoToSend.phone_number
        ) {
          this.errorMessages.push("Toate câmpurile pentru persoana juridică sunt obligatorii.");
          return;
        }
      } else if (this.client.billing_info.client_type === 'fizica') {
        // Reset company fields for individual
        billingInfoToSend.company_name = 'None';
        billingInfoToSend.cui = 'None';
        billingInfoToSend.registration_number = 'None';

        // Validate personal fields
        if (!billingInfoToSend.first_name ||
            !billingInfoToSend.last_name ||
          // !billingInfoToSend.cnp ||   optional
          // !billingInfoToSend.iban_name || optional
          !billingInfoToSend.judet ||
          !billingInfoToSend.oras ||
          !billingInfoToSend.phone_number
        ){
          this.errorMessages.push("Toate câmpurile pentru persoana fizică sunt obligatorii.");
          return;
        }

        // Validate CNP format
        const cnpRegex = /^[1-9]\d{12}$/;
        if (!cnpRegex.test(billingInfoToSend.cnp)) {
          this.errorMessages.push("CNP-ul introdus nu este valid.");
          return;
        }
      }

      // Validate IBAN for both types
      if (this.client.billing_info.iban && this.client.billing_info.iban !== 'None') {
        const ibanRegex = /RO[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){4}\s?/;
        if (!ibanRegex.test(this.client.billing_info.iban)) {
          this.errorMessages.push("IBAN-ul introdus nu este valid.");
          return;
        }
      }

      this.clientService.modifyBillingInfo(this.client.email, billingInfoToSend)
        .subscribe({
          next: (response: any) => {
            this.successMessage = response.message || "Date salvate cu succes.";
            this.toggleEditMode();
          },
          error: (error) => {
            let errObj;
            if (error.error) {
              if (typeof error.error === 'string') {
                try {
                  errObj = JSON.parse(error.error);
                } catch(e) {
                  errObj = error.error;
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

    onFieldFocus(field: string) {
      if (this.client.billing_info[field] === 'None') {
        this.client.billing_info[field] = '';
      }
    }

    onFieldBlur(field: string) {
      if (!this.client.billing_info[field]) {
        this.client.billing_info[field] = 'None';
      }
    }

    // Method to display a formatted value in the non-editable profile view
    displayValue(value: string): string {
      return value === 'None' ? 'Lipsa Date' : value;
    }

    // Method to show a message when clicking on a field with 'None' value
    showEditMessage() {
      if (!this.editMode) {
        this.infoMessage = 'Pentru a edita profilul, apăsați pe butonul "Editează Profil" din partea de sus a paginii.';
        // Clear the message after 3 seconds
        setTimeout(() => {
          this.infoMessage = '';
        }, 3000);
      }
    }
}
