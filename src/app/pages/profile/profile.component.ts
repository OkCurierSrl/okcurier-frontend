import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HighlightModule } from 'ngx-highlightjs';
import {FormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, NgIf, NgOptimizedImage} from "@angular/common";

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

  // Placeholder pentru datele profilului, inclusiv câmpurile personalizate
  profileData = {
    businessName: '',
    cui: '',
    phoneNumber: '',
    iban: '',
    statut: '',
    locale: ''
  };

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.user$.subscribe(
      (profile) => {
        this.profileJson = JSON.stringify(profile, null, 2);
        this.profileData = {
          ...this.profileData,
          statut: profile.timezone || '',
          locale: profile.locale || ''
        };
      }
    );
  }

  saveProfile() {
    // Logica pentru a salva datele profilului actualizate (de ex., trimitere la backend)
    console.log('Profil salvat:', this.profileData);
    this.editMode = false;
  }

  logout() {
    this.auth.logout({ logoutParams: {returnTo: document.location.origin }});
  }
}
