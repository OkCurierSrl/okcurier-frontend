import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClientService} from "../../../services/client.service";
import {Client} from "../../../model/client";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clients-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css', '../../dashboard/order-list/order-list.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  protected newClientEmail: string;
  protected newClientContractNumber: string;
  isProcessing = false;

  constructor(private clientService: ClientService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(
      (data: Client[]) => {
        this.clients = data;
        console.log('Clients loaded successfully', this.clients);
      },
      (error) => {
        console.error('Error loading clients', error);
      }
    );
  }

  // Method to handle client invitation
  inviteClient() {
    if (this.newClientEmail && this.newClientContractNumber) {
      this.clientService.inviteClient(this.newClientEmail, this.newClientContractNumber).subscribe(
        () => {
          alert('Client invitat cu succes!');
          // Reset form inputs
          this.newClientEmail = '';
          this.newClientContractNumber = '';
        },
        error => {
          console.error('Error inviting client:', error);
          alert('Eroare la invitarea clientului.');
        }
      );
    }
  }


  suspendAccess(client: Client): void {
    // Implement suspend access logic
    this.clientService.blockClientByEmail(client.email, !client.blocked).subscribe(
      () => {
        if (client.blocked) {
          alert('Client deblocat cu succes!');
        } else {
          alert('Client blocat cu succes!');
        }
        this.ngOnInit();
      },
      error => {
        console.error('Error inviting client:', error);
        alert('Eroare la blocarea clientului.');
      }
    );
  }

  deleteClient(client: Client): void {
    this.clientService.deleteClientByEmail(client.email).subscribe(
      () => {
          alert('Client sters cu succes!');
        this.ngOnInit();
      },
      error => {
        console.error('Error deleting client:', error);
        alert('Eroare la stergerea clientului.');
      }
    );
  }

  redirectToClientView(client: Client): void {
    this.router.navigate(['/admin/client-view'], {
      queryParams: {name: client.name, email: client.email}
    });
  }

  toggleKeepShippingCost(client: any) {
    this.isProcessing = true;

    const updatedBillingInfo = {
      ...client.billing_info,
      keep_shipping_cost: !client.billing_info.keep_shipping_cost
    };

    this.clientService.modifyBillingInfo(client.email, updatedBillingInfo)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: () => {
          client.billing_info.keep_shipping_cost = !client.billing_info.keep_shipping_cost;
          this.snackBar.open(
            'Starea de oprire din ramburs a fost actualizată cu succes',
            'OK',
            { duration: 3000 }
          );
        },
        error: (error) => {
          this.snackBar.open(
            'A apărut o eroare la actualizarea stării',
            'OK',
            { duration: 3000 }
          );
        }
      });
  }
}
