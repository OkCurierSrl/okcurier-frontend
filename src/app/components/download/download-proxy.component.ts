import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {OrderService} from "../../services/order.service";
import {DownloadService} from "../../services/download.service";

@Component({
  selector: 'app-download',
  standalone: true,
  template: '<div>Processing download...</div>' // Minimal template as this is just a download handler
})
export class DownloadProxyComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const awb = params['awb'];
      if (awb) {
        this.downloadAwb(awb);
      }
    });
  }

  downloadAwb(awb: string): void {
    this.orderService.downloadLabel(awb).subscribe(
      response => {
        this.downloadService.downloadLabel(response);
      },
      error => {
        console.error(`Failed to download label for order ${awb}.`, error);
      }
    );
  }
}
