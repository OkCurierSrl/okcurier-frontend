import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardModule} from "primeng/card";
import {ChipsModule} from "primeng/chips";
import {NgIf} from "@angular/common";
import {EmailService} from "../../../services/email.service";

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

  constructor(private fb: FormBuilder, private emailService: EmailService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      cif: ['', Validators.required],
      cui: ['', Validators.required],
      packagesPerMonth: ['', Validators.required],
      message: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactPhone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      awbEnvelopes: ['', Validators.required],
      awbBags: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      const formData = this.requestForm.value;
      const emailData = {
        to: 'contact@okcurier.ro',
        subject: 'Request for Materials',
        body: `
          CIF: ${formData.cif}
          Contact Person: ${formData.contactPerson}
          Contact Phone: ${formData.contactPhone}
          Email: ${formData.email}
          AWB Envelopes: ${formData.awbEnvelopes}
          AWB Bags: ${formData.awbBags}
        `
      };

      this.emailService.sendEmail(emailData).subscribe(response => {
        console.log('Email sent successfully:', response);
      }, error => {
        console.error('Error sending email:', error);
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
