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
      this.editMode = !this.editMode; // Clear any previous messages
      this.errorMessages = [];
    }

    onClientTypeChange()
    {
      if (this.client.billing_info) {
        this.client.billing_info.clientType = this.clientType;
      }
    }

    saveProfile() {
      this.errorMessages = [];
      this.successMessage = '';

      // Validare pentru persoana juridică
      if (this.client.billing_info.clientType === 'juridica') {
        if (!this.client.billing_info.company_name ||
            !this.client.billing_info.cui ||
            !this.client.billing_info.registration_number) {
          this.errorMessages.push("Toate câmpurile pentru persoana juridică sunt obligatorii.");
          return;
        }
      }
      // Validare pentru persoana fizică
      else if (this.client.billing_info.clientType === 'fizica') {
        if (!this.client.billing_info.firstName ||
            !this.client.billing_info.lastName ||
            !this.client.billing_info.cnp ||
            !this.client.billing_info.judet ||
            !this.client.billing_info.oras ||
            !this.client.billing_info.adresa) {
          this.errorMessages.push("Toate câmpurile pentru persoana fizică sunt obligatorii.");
          return;
        }
      }

      // Validare IBAN separată pentru ambele tipuri
      if (this.client.billing_info.iban) {
        const ibanRegex = /RO[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){4}\s?/;
        if (!ibanRegex.test(this.client.billing_info.iban)) {
          this.errorMessages.push("IBAN-ul introdus nu este valid.");
          return;
        }
      } else {
        this.errorMessages.push("IBAN-ul este obligatoriu.");
        return;
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
}




