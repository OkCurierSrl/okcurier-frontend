import { Component, Input, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from "primeng/inputtext";
import {NgClass} from "@angular/common";
import {ButtonDirective} from "primeng/button";

@Component({
  selector: 'app-package-form',
  templateUrl: './package-form.component.html',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    NgClass,
    ButtonDirective
  ],
  styleUrls: ['./package-form.component.css']
})
export class PackageFormComponent implements OnInit {
  @Input() index: number;
  @Input() packageForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (!this.packageForm) {
      this.packageForm = this.fb.group({
        length: ['', Validators.required],
        width: ['', Validators.required],
        height: ['', Validators.required],
        weight: ['', Validators.required],
        // Add other controls here
      });
    }
  }

  removePackage(index: number): void {
    // Emit an event to remove the package from parent component
  }
}
