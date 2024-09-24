export interface ProcessingStatus {
  status: string;
  file?: Blob; // Optional field if your status response contains the file directly.
}
