import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ChipsModule} from "primeng/chips";
import {ButtonDirective} from "primeng/button";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-package-form',
  templateUrl: './package-form.component.html',
  standalone: true,
  imports: [
    ChipsModule,
    ReactiveFormsModule,
    ButtonDirective,
    NgClass,
    NgIf
  ],
  styleUrls: ['./package-form.component.css']
})
export class PackageFormComponent implements OnInit {
  @Input() index: number;
  @Input() packageForm: FormGroup;
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() remove = new EventEmitter<number>();
  @Output() weightChange = new EventEmitter<void>();
  @Output() lengthChange = new EventEmitter<void>();
  @Output() widthChange = new EventEmitter<void>();
  @Output() heightChange = new EventEmitter<void>();

  dimensionError: boolean = false;
  weightError: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.packageForm.statusChanges.subscribe(() => {
      this.checkValidity();
    });
    this.checkValidity();
    this.packageForm.get('weight').valueChanges.subscribe(() => {
      this.weightChange.emit();
    })
    ;this.packageForm.get('length').valueChanges.subscribe(() => {
      this.lengthChange.emit();
    });
    this.packageForm.get('width').valueChanges.subscribe(() => {
      this.widthChange.emit();
    });
    this.packageForm.get('height').valueChanges.subscribe(() => {
      this.heightChange.emit();
    });

  }

  checkValidity(): void {
    const length = this.packageForm.get('length').value;
    const width = this.packageForm.get('width').value;
    const height = this.packageForm.get('height').value;
    const weight = this.packageForm.get('weight').value;

    this.dimensionError = (length + width + height) > 180;
    this.weightError = weight > 31;

    const isValid = this.packageForm.valid && !this.dimensionError && !this.weightError;
    this.validityChange.emit(isValid);
  }

  removePackage(): void {
    this.remove.emit(this.index);
  }

}
