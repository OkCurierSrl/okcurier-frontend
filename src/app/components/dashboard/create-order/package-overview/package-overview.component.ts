import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-package-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './package-overview.component.html',
  styleUrl: './package-overview.component.css'
})
export class PackageOverviewComponent implements OnChanges {
  @Input() packages: { form: FormGroup, valid: boolean }[] = [];
  totalWeight: number = 0;
  totalPackages: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.packages) {
      this.calculateOverview();
    }
  }

  calculateOverview(): void {
    this.totalWeight = this.packages.reduce((acc, pkg) => {
      const length = pkg.form.value.length || 0;
      const width = pkg.form.value.width || 0;
      const height = pkg.form.value.height || 0;
      const realWeight = pkg.form.value.weight || 0;

      const dimensionalWeight = (length * width * height) / 5000;
      const effectiveWeight = Math.max(realWeight, dimensionalWeight);
      return acc + effectiveWeight;
    }, 0);
  }
}
