import { Component } from '@angular/core';
import { UploadService } from "../../../services/upload.service";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { interval, Subject } from "rxjs";
import { finalize, switchMap, takeUntil } from "rxjs/operators";
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ProgressBarModule,
    ButtonModule
  ],
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFiles: { [key: string]: File } = {}; // Changed to object
  responseMessage: string | null = null;
  processing: boolean = false;
  uploading: boolean = false;
  uploadProgress: number = 0;
  taskId: string | null = null;
  sendEmails: boolean = false; // Initialize with default value
  private stopPolling = new Subject<void>();
  private cancelUpload = new Subject<void>();

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event, courier: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[courier] = input.files[0];
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    // Check if at least one file is selected
    if (Object.keys(this.selectedFiles).length === 0) {
      this.responseMessage = 'Please select at least one file to upload.';
      return;
    }

    const formData = new FormData();

    // Append files with the 'files' key as expected by the backend
    Object.entries(this.selectedFiles).forEach(([courier, file]) => {
      formData.append('files', file);
    });

    this.uploading = true;
    this.uploadProgress = 0;
    this.responseMessage = 'Uploading files...';

    this.uploadService.uploadFiles(formData, this.sendEmails,
      // Progress callback
      (progress: number) => {
        this.uploadProgress = progress;
      },
      // Cancel token
      this.cancelUpload
    ).subscribe({
      next: (taskId) => {
        this.taskId = taskId;
        this.uploading = false;
        this.processing = true;
        this.responseMessage = 'Files uploaded successfully! Processing started...';
        this.startPollingStatus(taskId);
      },
      error: (error) => {
        console.error('Error uploading files:', error);
        this.responseMessage = 'Error uploading files. Please try again.';
        this.uploading = false;
        this.processing = false;
        this.uploadProgress = 0;
      }
    });
  }

  cancelOperation(): void {
    if (this.uploading) {
      this.cancelUpload.next();
      this.cancelUpload.complete();
      this.cancelUpload = new Subject<void>();
    }
    if (this.processing) {
      this.stopPolling.next();
    }
    this.uploading = false;
    this.processing = false;
    this.uploadProgress = 0;
    this.responseMessage = 'Operation cancelled';
  }

  startPollingStatus(taskId: string): void {
    // Stop any existing polling
    this.stopPolling.next();

    interval(5000)
      .pipe(
        switchMap(() => this.uploadService.checkProcessingStatus(taskId)),
        takeUntil(this.stopPolling),
        finalize(() => {
          this.processing = false;
          console.log('Polling stopped');
        })
      )
      .subscribe({
        next: (status: string) => {
          this.responseMessage = `Current status: ${status}`;
          if (status === 'Completed' || status === 'Error') {
            this.stopPolling.next();
            if (status === 'Completed') {
              this.downloadFile(taskId);
            }
          }
        },
        error: (error) => {
          console.error('Error checking status:', error);
          this.responseMessage = 'Error checking status. Please try again.';
          this.processing = false;
        }
      });
  }

  private downloadFile(taskId: string): void {
    this.uploadService.downloadResult(taskId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'processed-results.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.responseMessage = 'Error downloading file. Please try again.';
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling.next();
    this.stopPolling.complete();
  }

  protected readonly Object = Object;
}
