import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FileUploadComponent } from './file-upload.component';
import { UploadService } from '../../../services/upload.service';
import { FormsModule } from '@angular/forms';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let uploadService: jasmine.SpyObj<UploadService>;

  beforeEach(async () => {
    // Create a spy object for UploadService with the necessary methods.
    const uploadServiceSpy = jasmine.createSpyObj('UploadService', [
      'uploadFiles',
      'checkProcessingStatus',
      'downloadResult'
    ]);

    await TestBed.configureTestingModule({
      // Because the component is standalone, we add it to imports.
      imports: [HttpClientTestingModule, FormsModule, FileUploadComponent],
      providers: [{ provide: UploadService, useValue: uploadServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    uploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select files', () => {
    const file = new File(['dummy content'], 'dpd.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    // Simulate the event coming from a file input
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileSelected(event, 'dpd.xlsx');
    // Note: onFileSelected stores the file using the given name as key.
    expect(component.selectedFiles['dpd.xlsx']).toBe(file);
  });

  it('should upload one file', () => {
    // For onSubmit to work, selectedFiles must be a numeric-indexed array.
    const file = new File(['dummy content'], 'dpd.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    component.selectedFiles = [file]; // set as an array so .length > 0

    const taskId = 'task-1';
    uploadService.uploadFiles.and.returnValue(of(taskId));
    // Simulate immediate "Completed" status from polling
    uploadService.checkProcessingStatus.and.returnValue(of('Completed'));
    // Also, simulate downloadResult (though we are not testing download here)
    uploadService.downloadResult.and.returnValue(of(new Blob([''], { type: 'application/zip' })));

    const submitEvent = new Event('submit');
    spyOn(submitEvent, 'preventDefault'); // ensure preventDefault is called
    component.onSubmit(submitEvent);

    expect(submitEvent.preventDefault).toHaveBeenCalled();
    expect(uploadService.uploadFiles).toHaveBeenCalled();

    // Verify that the FormData passed to uploadFiles includes our file.
    const formData: FormData = uploadService.uploadFiles.calls.mostRecent().args[0];
    const uploadedFiles = formData.getAll('files') as File[];
    expect(uploadedFiles.length).toBe(1);
    expect(uploadedFiles[0].name).toBe('dpd.xlsx');

    // Also check that the response and taskId have been set.
    expect(component.taskId).toBe(taskId);
    expect(component.responseMessage).toBe('Files uploaded successfully! Processing started...');
  });

  it('should upload all files with appropriate names', () => {
    
    // Create files with names for dpd, gls, cargus, sameday.
    const fileNames = ['dpd.xlsx', 'gls.xlsx', 'cargus.xlsx', 'sameday.xlsx'];
    const files = fileNames.map(name =>
      new File(['file content'], name, { type: 'application/octet-stream' })
    );
    // Set selectedFiles as a numeric array so forEach will iterate.
    component.selectedFiles = files;

    const taskId = 'task-all';
    uploadService.uploadFiles.and.returnValue(of(taskId));
    uploadService.checkProcessingStatus.and.returnValue(of('Completed'));
    uploadService.downloadResult.and.returnValue(of(new Blob([''], { type: 'application/zip' })));

    const submitEvent = new Event('submit');
    spyOn(submitEvent, 'preventDefault');
    component.onSubmit(submitEvent);

    expect(submitEvent.preventDefault).toHaveBeenCalled();
    expect(uploadService.uploadFiles).toHaveBeenCalled();

    const formData: FormData = uploadService.uploadFiles.calls.mostRecent().args[0];
    const uploadedFiles = formData.getAll('files') as File[];
    expect(uploadedFiles.length).toBe(4);
    // Verify that the file names sent to the backend match the expected names.
    const uploadedFileNames = uploadedFiles.map(f => f.name);
    expect(uploadedFileNames).toEqual(fileNames);

    expect(component.taskId).toBe(taskId);
    expect(component.responseMessage).toBe('Files uploaded successfully! Processing started...');
  });

  it('should start download on processing completion', fakeAsync(() => {
    const file = new File(['dummy content'], 'dpd.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    component.selectedFiles = [file];

    const taskId = 'task-download';
    uploadService.uploadFiles.and.returnValue(of(taskId));
    // Simulate polling immediately returning "Completed" so downloadFile() will be triggered.
    uploadService.checkProcessingStatus.and.returnValue(of('Completed'));
    const blob = new Blob(['dummy zip content'], { type: 'application/zip' });
    uploadService.downloadResult.and.returnValue(of(blob));

    const submitEvent = new Event('submit');
    spyOn(submitEvent, 'preventDefault');
    component.onSubmit(submitEvent);

    // Fast-forward time for the interval (polling every 5000ms)
    tick(5000);
    flush();

    expect(uploadService.checkProcessingStatus).toHaveBeenCalledWith(taskId);
    expect(uploadService.downloadResult).toHaveBeenCalledWith(taskId);
  }));

  it('should alert if backend returns error on upload', () => {
    const file = new File(['dummy content'], 'dpd.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    component.selectedFiles = [file];

    // Simulate an error from the backend
    uploadService.uploadFiles.and.returnValue(throwError('Upload error'));

    const submitEvent = new Event('submit');
    spyOn(submitEvent, 'preventDefault');
    component.onSubmit(submitEvent);

    expect(uploadService.uploadFiles).toHaveBeenCalled();
    expect(component.responseMessage).toBe('Error uploading files. Please try again.');
  });
});
