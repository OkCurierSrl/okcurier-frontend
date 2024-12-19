import {ApiDownloadResponse} from "../components/dashboard/courier-options/api-download.response";
import {Injectable} from "@angular/core";



@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  public downloadLabel(response: ApiDownloadResponse): void {
    const labelData = response.label;

    if (!labelData) {
      console.error('No label data found in the response.');
      return;
    }

    let labelBlob: Blob;

    // Check the type of labelData
    if (typeof labelData === 'string') {
      // If labelData is a base64 string
      labelBlob = this.base64ToBlob(labelData, 'application/pdf');
    } else if (labelData instanceof Array) {
      // If labelData is an array of numbers
      const byteArray = new Uint8Array(labelData);
      labelBlob = new Blob([byteArray], {type: 'application/pdf'});
    } else {
      console.error('Unexpected label format:', typeof labelData);
      return;
    }

    // Create a URL for the Blob
    const blobUrl = URL.createObjectURL(labelBlob);

    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'label.pdf'; // You can set a dynamic filename if needed
    link.click();

    // Clean up
    URL.revokeObjectURL(blobUrl);
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }

}
