import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RequestOfferComponent } from './request-offer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { EmailService } from '../../../services/email.service';

class FakeEmailService {
  sendEmail(emailData: any) {
    return of({ success: true });
  }
}

describe('RequestOfferComponent', () => {
  let component: RequestOfferComponent;
  let fixture: ComponentFixture<RequestOfferComponent>;
  let emailService: EmailService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RequestOfferComponent, ReactiveFormsModule],
      providers: [
        { provide: EmailService, useClass: FakeEmailService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestOfferComponent);
    component = fixture.componentInstance;
    emailService = TestBed.inject(EmailService);
    fixture.detectChanges(); // triggers ngOnInit() and form init
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.requestForm).toBeDefined();
    const controls = component.requestForm.controls;
    expect(controls['cui']).toBeDefined();
    expect(controls['packagesPerMonth']).toBeDefined();
    expect(controls['message']).toBeDefined();
    expect(controls['contactPerson']).toBeDefined();
    expect(controls['contactPhone']).toBeDefined();
    expect(controls['email']).toBeDefined();
    expect(controls['awbEnvelopes']).toBeDefined();
    expect(controls['awbBags']).toBeDefined();
  });

  it('should return proper error messages for invalid fields', () => {
    // Mark a control as touched and invalid
    const emailControl = component.requestForm.get('email');
    emailControl.setValue('');
    emailControl.markAsTouched();
    fixture.detectChanges();
    expect(component.getErrorMessage('email')).toEqual('Adresa de e-mail este obligatorie.');
    emailControl.setValue('invalid-email');
    fixture.detectChanges();
    expect(component.getErrorMessage('email')).toEqual('Adresa de e-mail nu este validă.');
  });

  it('should disable the submit button when the form is invalid', () => {
    component.requestForm.reset();
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('should enable the submit button when the form is valid and not loading', () => {
    component.requestForm.setValue({
      cui: '123456',
      packagesPerMonth: '10',
      message: 'Test message',
      contactPerson: 'John Doe',
      contactPhone: '0712345678',
      email: 'test@example.com',
      awbEnvelopes: '5',
      awbBags: '3'
    });
    component.isLoading = false;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();
  });

  it('should call emailService.sendEmail and display a success message when the form is valid', fakeAsync(() => {
    spyOn(emailService, 'sendEmail').and.callThrough();
    component.requestForm.setValue({
      cui: '123456',
      packagesPerMonth: '10',
      message: 'Test message',
      contactPerson: 'John Doe',
      contactPhone: '0712345678',
      email: 'test@example.com',
      awbEnvelopes: '5',
      awbBags: '3'
    });
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();

    component.onSubmit();
    fixture.detectChanges();
    tick(); // simulate async response
    fixture.detectChanges();
    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.successMessage).toEqual('Email trimis cu succes!');

    // Check that the success message div is centered
    const successDiv: HTMLElement = fixture.nativeElement.querySelector('.success-message');
    expect(successDiv).toBeTruthy();
    // Simulate 3 seconds for fade-out (using tick with 3000 ms)
    tick(3000);
    fixture.detectChanges();
    expect(component.successMessage).toEqual('');
  }));

  it('should mark all fields as touched if form is invalid on submit', () => {
    spyOn(component.requestForm, 'markAllAsTouched');
    component.requestForm.reset();
    component.onSubmit();
    expect(component.requestForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should log an error and disable loading if sendEmail fails', fakeAsync(() => {
    spyOn(emailService, 'sendEmail').and.returnValue(throwError('Error sending email'));
    component.requestForm.setValue({
      cui: '123456',
      packagesPerMonth: '10',
      message: 'Test message',
      contactPerson: 'John Doe',
      contactPhone: '0712345678',
      email: 'test@example.com',
      awbEnvelopes: '5',
      awbBags: '3'
    });
    fixture.detectChanges();
    component.onSubmit();
    tick();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  }));
});
