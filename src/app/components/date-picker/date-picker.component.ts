import {Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {FormsModule} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";


@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,           // For [(ngModel)]
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,    // Required for datepicker functionality
    PaginatorModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css' // Incorrect property name
})
export class DatePickerComponent {
  pickupDate: Date;
  minDate: Date;

  constructor(
    public dialogRef: MatDialogRef<DatePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.minDate = new Date();
  }

  onConfirm(): void {
    if (this.pickupDate) {
      this.dialogRef.close(this.pickupDate);
    } else {
      alert('Please select a pickup date.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
