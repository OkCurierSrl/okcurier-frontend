import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { EmailService } from "../../../services/email.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['../request-offer/request-offer.component.css']
})
export class TicketComponent implements OnInit {
  ticketForm: FormGroup;

  constructor(private fb: FormBuilder, private emailService: EmailService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.ticketForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      issueType: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      const formValue = this.ticketForm.value;
      const emailPayload = {
        to: 'contact@okcurier.ro',
        subject: `Ticket from ${formValue.name}`,
        body: `
          Name: ${formValue.name}\n
          Email: ${formValue.email}\n
          Phone: ${formValue.phone}\n
          Issue Type: ${formValue.issueType}\n
          Description: ${formValue.description}
        `
      };
      this.emailService.sendEmail(emailPayload).subscribe(response => {
        console.log('Ticket submitted successfully');
      }, error => {
        console.error('Error submitting ticket', error);
      });
    } else {
      console.log('Form is invalid');
    }
  }
}