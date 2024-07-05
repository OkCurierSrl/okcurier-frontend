import { Component, Input, OnInit } from '@angular/core';
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

  dimensionError: boolean = false;
  weightError: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (!this.packageForm) {
      this.packageForm = this.fb.group({
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        weight: ['', [Validators.required, Validators.min(1), Validators.max(31)]]
      });
    }

    this.packageForm.valueChanges.subscribe(() => {
      this.validateDimensions();
      this.validateWeight();
    });
  }

  validateDimensions(): void {
    const { length, width, height } = this.packageForm.value;
    this.dimensionError = (length + width + height) > 180;
  }

  validateWeight(): void {
    const { weight } = this.packageForm.value;
    this.weightError = weight > 31;
  }

  removePackage(index: number): void {
    // Emit an event to remove the package from parent component
  }
}
