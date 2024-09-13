import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClientService} from "../../../services/client.service";
import {Client} from "../../../model/client";
import {Router} from "@angular/router";

@Component({
  selector: 'app-clients-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css', '../../dashboard/order-list/order-list.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService, private router: Router) {}

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

  suspendAccess(client: Client): void {
    // Implement suspend access logic
    console.log('Suspend access for', client);
    // Example: this.clientService.suspendAccess(client.id).subscribe(...);
  }

  deleteClient(client: Client): void {
    // Implement delete client logic
    console.log('Delete client', client);
    // Example: this.clientService.deleteClient(client.id).subscribe(...);
  }

  redirectToClientView(client: Client): void {
    this.router.navigate(['/admin/client-view'], {
      queryParams: {name: client.name, email: client.email}
    });
  }
}
