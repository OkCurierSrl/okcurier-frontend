import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent} from "../../public/footer/footer.component";
import {RouterOutlet} from "@angular/router";
import {AdminNavbarComponent} from "../admin-navbar/admin-navbar.component";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FooterComponent, RouterOutlet, AdminNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

}
