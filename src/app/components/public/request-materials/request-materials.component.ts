import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {EmailService} from "../../../services/email.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-request-materials',
  templateUrl: './request-materials.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./request-materials.component.css']
})
export class RequestMaterialsComponent implements OnInit {
  requestForm: FormGroup;

  constructor(private fb: FormBuilder, private emailService: EmailService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      numEnvelopes: ['', [Validators.required, Validators.min(100)]],
      numBags: ['', [Validators.required, Validators.min(100)]]
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      const formData = this.requestForm.value;
      const emailPayload = {
        to: 'contact@okcurier.ro',
        subject: 'Solicitare Materiale',
        body: `
          Nume: ${formData.name}\n
          Adresa: ${formData.address}\n
          Telefon: ${formData.phone}\n
          Numar Plicuri AWB: ${formData.numEnvelopes}\n
          Numar Pungi AWB: ${formData.numBags}
        `
      };

      this.emailService.sendEmail(emailPayload).subscribe(response => {
        console.log('Email sent successfully', response);
      }, error => {
        console.log('Error sending email', error);
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
