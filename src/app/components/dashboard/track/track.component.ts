
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { MetaTagService } from '../../../services/meta-tag.service';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit, OnDestroy {
  awbNumber: string = '';
  showError: boolean = false; // Flag to show error message

  constructor(private router: Router, private orderService: OrderService, private metaTagService: MetaTagService) {}

  ngOnInit(): void {
    // Set noindex meta tag for tracking pages
    this.metaTagService.setNoIndexForTrackingPage();
  }

  ngOnDestroy(): void {
    // Reset meta tags when component is destroyed (if needed)
    this.metaTagService.resetMetaTags();
  }

  navigateToAWB() {
    if (this.awbNumber.trim()) {

      // Use the awbExists method from OrderService to check if the AWB exists
      this.orderService.awbExists(this.awbNumber).subscribe(
        (response) => {
          if (response.exists === true) {
            // AWB exists, proceed with navigation
            const currentPath = this.router.url;
            const basePath = currentPath.replace(/\/track$/, ''); // Adjust to match your current path structure
            const targetPath = `${basePath}/track/${this.awbNumber}`;
            this.router.navigate([targetPath]);
          } else {
            this.showError = true;
          }
        },
        (error) => {
          this.showError = true;
        }
      );
    } else {
      this.showError = true;
    }
  }
}
