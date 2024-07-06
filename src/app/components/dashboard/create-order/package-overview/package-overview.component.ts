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
  showPackageLimitWarning: boolean = false;
  showWeightLimitWarning: boolean = false;
  showPlicWarning: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.packages) {
      this.calculateOverview();
    }
  }

  calculateOverview(): void {
    this.totalPackages = this.packages.length;
    this.totalWeight = this.packages.reduce((acc, pkg) => acc + (pkg.form.value.weight || 0), 0);
    this.checkWarnings();
  }

  checkWarnings(): void {
    this.showPackageLimitWarning = this.totalPackages > 10;
    this.showWeightLimitWarning = this.packages.some(pkg => {
      const length = pkg.form.value.length || 0;
      const width = pkg.form.value.width || 0;
      const height = pkg.form.value.height || 0;
      const weight = pkg.form.value.weight || 0;
      return length + width + height > 180 || weight > 31;
    });
    this.showPlicWarning = this.totalPackages === 1 && this.packages[0].form.value.weight <= 0.25;
  }
}
