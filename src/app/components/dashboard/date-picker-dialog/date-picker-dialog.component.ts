import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-date-picker-dialog',
  template: `
    <div class="dialog-backdrop" (click)="onCancel()"></div>
    <div class="dialog-content">
      <h2>Select Pickup Date</h2>
      <div class="input-container">
        <input
          type="date"
          [(ngModel)]="pickupDate"
          [min]="minDateString"
          class="date-input"
        />
      </div>
      <div class="dialog-actions">
        <button class="dialog-button cancel-button" (click)="onCancel()">
          Cancel
        </button>
        <button class="dialog-button confirm-button" (click)="onConfirm()">
          OK
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* Backdrop */
      .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      /* Dialog Content */
      .dialog-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1);
        background-color: #ffffff;
        padding: 30px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        animation: fadeIn 0.3s ease-out;
      }

      /* Dialog Animation */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      /* Heading */
      h2 {
        margin-top: 0;
        font-size: 1.5em;
        color: #333;
        text-align: center;
      }

      /* Input Container */
      .input-container {
        margin: 20px 0;
        text-align: center;
      }

      /* Date Input */
      .date-input {
        width: 100%;
        padding: 12px 16px;
        font-size: 1em;
        border: 1px solid #ccc;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.3s;
      }

      .date-input:focus {
        border-color: #3f51b5;
      }

      /* Dialog Actions */
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      /* Buttons */
      .dialog-button {
        padding: 10px 20px;
        font-size: 1em;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .cancel-button {
        background-color: #e0e0e0;
        color: #333;
      }

      .cancel-button:hover {
        background-color: #d5d5d5;
      }

      .confirm-button {
        background-color: #3f51b5;
        color: #fff;
        margin-left: 10px;
      }

      .confirm-button:hover {
        background-color: #354497;
      }
    `,
  ],
  imports: [
    FormsModule
  ],
  standalone: true
})
export class DatePickerDialogComponent implements OnInit {
  pickupDate: string;
  minDateString: string;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  constructor() {
    const today = new Date();
    this.minDateString = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Initialize pickupDate with today's date
    this.pickupDate = this.minDateString;
  }

  onConfirm(): void {
    if (this.pickupDate) {
      this.confirm.emit(this.pickupDate);
    } else {
      alert('Please select a pickup date.');
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
