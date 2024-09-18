import {Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup} from "@angular/forms";
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-package-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './package-overview.component.html',
  styleUrls: ['./package-overview.component.css']
})
export class PackageOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() packages: { form: FormGroup, valid: boolean }[] = [];
  totalWeight: number = 0;
  totalPackages: number = 0;
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.calculateOverview();
    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.packages) {
      this.calculateOverview();
      // Unsubscribe from old subscriptions
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
      // Setup new subscriptions for the updated packages array
      this.setupSubscriptions();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupSubscriptions(): void {
    this.packages.forEach(pkg => {
      const sub = pkg.form.valueChanges.subscribe(() => {
        this.calculateOverview();
      });
      this.subscriptions.add(sub);
    });
  }

  calculateOverview(): void {
    this.totalPackages = this.packages.length;
    this.totalWeight = this.packages.reduce((acc, pkg) => {
      const length = pkg.form.value.length || 0;
      const width = pkg.form.value.width || 0;
      const height = pkg.form.value.height || 0;
      const realWeight = pkg.form.value.weight || 0;
      const dimensionalWeight = (length * width * height) / 5000;
      const effectiveWeight = Math.max(realWeight, dimensionalWeight);
      console.log("realWeight " + realWeight);
      console.log("dimensionalWeight " + dimensionalWeight);
      console.log("effectiveWeight " + effectiveWeight);
      console.log("============= ");

      return acc + effectiveWeight;
    }, 0);
  }
}
