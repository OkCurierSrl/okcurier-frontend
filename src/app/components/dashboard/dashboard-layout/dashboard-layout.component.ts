import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdminNavbarComponent} from "../../admin/admin-navbar/admin-navbar.component";
import {FooterComponent} from "../../public/footer/footer.component";
import {RouterOutlet} from "@angular/router";
import {DashboardNavbarComponent} from "../dashboard-navbar/dashboard-navbar.component";

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent, FooterComponent, RouterOutlet, DashboardNavbarComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

}
