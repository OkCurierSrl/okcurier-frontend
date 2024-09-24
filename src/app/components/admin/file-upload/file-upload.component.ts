import { Component } from '@angular/core';
import { UploadService } from "../../../services/upload.service";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";

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
          next: (response) => {
            this.downloadFile(response, "excel-files.zip"); // Updated to download the ZIP file
            this.responseMessage = 'Files uploaded and processed successfully!';
          },
          error: (error) => {
            console.error('Error uploading files:', error);
            this.responseMessage = 'Error uploading files. Please try again.';
          }
        });
    }
  }

  // Utility function to download file
  downloadFile(data: Blob, filename: string): void {
    const blob = new Blob([data], { type: 'application/zip' }); // Updated type to 'application/zip'
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Download the file with the correct ZIP filename
    a.click();
    window.URL.revokeObjectURL(url); // Release the memory used by the object URL
  }
}
