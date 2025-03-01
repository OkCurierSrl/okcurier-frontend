import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChipsModule } from 'primeng/chips';
import { NgIf } from '@angular/common';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-request-offer',
  templateUrl: './request-offer.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ChipsModule,
    NgIf
  ],
  styleUrls: ['./request-offer.component.css']
})
export class RequestOfferComponent implements OnInit {
  title = 'Cere oferta';
  requestForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private emailService: EmailService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      cui: ['', Validators.required],
      packagesPerMonth: ['', Validators.required],
      message: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactPhone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.requestForm.get(controlName);
    if (control && control.touched && control.errors) {
      if (control.errors.required) {
        switch (controlName) {
          case 'cui':
            return 'CUI este obligatoriu.';
          case 'packagesPerMonth':
            return 'Numărul de colete pe lună este obligatoriu.';
          case 'message':
            return 'Mesajul este obligatoriu.';
          case 'contactPerson':
            return 'Persoana de contact este obligatorie.';
          case 'contactPhone':
            return 'Telefonul de contact este obligatoriu.';
          case 'email':
            return 'Adresa de e-mail este obligatorie.';
          default:
            return 'Acest câmp este obligatoriu.';
        }
      }
      if (control.errors.email) {
        return 'Adresa de e-mail nu este validă.';
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.isLoading = true;
      const formData = this.requestForm.value;
      const emailData = {
        to: 'contact@okcurier.ro',
        subject: 'Solicitare Ofertă Nouă',
        body: `
          CUI / Denumire societate: ${formData.cui}
          Persoană de contact: ${formData.contactPerson}
          Telefon contact: ${formData.contactPhone}
          Email: ${formData.email}
          Număr colete pe lună: ${formData.packagesPerMonth}
          Mesaj: ${formData.message}
        `
      };

      this.emailService.sendEmail(emailData).subscribe(response => {
        console.log('Email trimis cu succes:', response);
        this.isLoading = false;
        this.successMessage = 'Vă mulțumim pentru solicitare, veți fi contactat în cel mai scurt timp de echipa OkCurier';
        setTimeout(() => {
          this.successMessage = '';
          this.initForm();
        }, 6000);
      }, error => {
        console.error('Eroare la trimiterea emailului:', error);
        this.isLoading = false;
      });
    } else {
      console.log('Formularul nu este valid');
      this.requestForm.markAllAsTouched();
    }
  }
}
