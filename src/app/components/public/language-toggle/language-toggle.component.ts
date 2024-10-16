import { Component } from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./language-toggle.component.css']
})
export class LanguageToggleComponent {
  isOpen = false;
  languages: Language[] = [
    { code: 'ro', name: 'Română', flag: 'assets/flags/ro.png' },
    { code: 'en', name: 'English', flag: 'assets/flags/en.png' }
  ];
  selectedLanguage: Language = this.languages[0];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    console.log("dropdow "  + this.isOpen)
  }

  selectLanguage(language: Language) {
    this.selectedLanguage = language;
    this.isOpen = false;
  }
}
