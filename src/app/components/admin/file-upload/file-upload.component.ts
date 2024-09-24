import { Component } from '@angular/core';
import { UploadService } from "../../../services/upload.service";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {interval} from "rxjs";
import {switchMap, takeWhile} from "rxjs/operators";
import {ProcessingStatus} from "../../../services/processing-status.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ],
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFiles: File[] = [];
  responseMessage: string | null = null;
  processing: boolean = false;
  taskId: string | null = null;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault(); // Prevent the default form submission

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => {
        formData.append('files', file, file.name);
      });

      this.uploadService.uploadFiles(formData)
        .subscribe({
          next: (taskId) => {
            this.taskId = taskId;
            this.responseMessage = 'Files uploaded successfully! Processing started...';
            this.startPollingStatus(taskId);
          },
          error: (error) => {
            console.error('Error uploading files:', error);
            this.responseMessage = 'Error uploading files. Please try again.';
          }
        });
    }
  }

  startPollingStatus(taskId: string): void {
    this.processing = true;

    interval(5000) // Poll every 5 seconds
      .pipe(
        switchMap(() => this.uploadService.checkProcessingStatus(taskId)),
        takeWhile((status: ProcessingStatus) => status.status !== 'Completed' && status.status !== 'Error')
      )
      .subscribe({
        next: (status: ProcessingStatus) => {
          this.responseMessage = `Current status: ${status.status}`;
          if (status.status === 'Completed') {
            this.downloadFile(taskId);
            this.processing = false;
          }
        },
        error: (error) => {
          console.error('Error checking status:', error);
          this.responseMessage = 'Error checking status. Please try again.';
          this.processing = false;
        }
      });
  }

  downloadFile(taskId: string): void {
    this.uploadService.downloadResult(taskId)
      .subscribe({
        next: (blob) => this.downloadFileFromBlob(blob, "excel-files.zip"),
        error: (error) => {
          console.error('Error downloading file:', error);
          this.responseMessage = 'Error downloading file. Please try again.';
        }
      });
  }

  downloadFileFromBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
