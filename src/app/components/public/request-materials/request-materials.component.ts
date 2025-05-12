import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChipsModule } from 'primeng/chips';
import { NgIf } from '@angular/common';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-request-materials',
  templateUrl: './request-materials.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ChipsModule,
    NgIf
  ],
  styleUrls: ['./request-materials.component.css']
})
export class RequestMaterialsComponent implements OnInit {
  requestForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private emailService: EmailService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^07\d{8}$/)]],
      numEnvelopes: ['', [Validators.required, Validators.min(0)]],
      numBags: ['', [Validators.required, Validators.min(0)]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.requestForm.get(controlName);
    if (control && control.touched && control.errors) {
      if (control.errors.required) {
        switch (controlName) {
          case 'name':
            return 'Numele este obligatoriu.';
          case 'email':
            return 'Adresa de e-mail este obligatorie.';
          case 'address':
            return 'Adresa este obligatorie.';
          case 'phone':
            return 'Numărul de telefon este obligatoriu.';
          case 'numEnvelopes':
            return 'Numărul de plicuri este obligatoriu.';
          case 'numBags':
            return 'Numărul de pungi este obligatoriu.';
          default:
            return 'Acest câmp este obligatoriu.';
        }
      }
      if (control.errors.email) {
        return 'Adresa de e-mail nu este validă.';
      }
      if (control.errors.pattern && controlName === 'phone') {
        return 'Numărul de telefon trebuie să înceapă cu 07 și să conțină 10 cifre.';
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.isLoading = true;
      const formData = this.requestForm.value;
      const emailPayload = {
        to: 'contact@okcurier.ro',
        subject: 'Solicitare Materiale',
        body: `
          Nume: ${formData.name}\n
          Email: ${formData.email}\n
          Adresa: ${formData.address}\n
          Telefon: ${formData.phone}\n
          Numar Plicuri AWB: ${formData.numEnvelopes}\n
          Numar Pungi AWB: ${formData.numBags}
        `
      };

      this.emailService.sendEmail(emailPayload).subscribe(
        response => {
          console.log('Email sent successfully:', response);
          this.isLoading = false;
          this.successMessage = 'Solicitarea a fost trimisă cu succes!';
          setTimeout(() => {
            this.successMessage = '';
            this.initForm();
          }, 3000);
        },
        error => {
          console.error('Error sending email:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.log('Form is invalid');
      this.requestForm.markAllAsTouched();
    }
  }
}
