import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { Client } from '../../model/client';
import { ClientService } from '../../services/client.service';

/**
 * Create a FakeAuthService so that when the component calls
 * this.auth.user$.subscribe(...) it works.
 */
class FakeAuthService {
  user$ = new BehaviorSubject<any>({
    name: 'Test User',
    email: 'test@example.com'
  });
  logout() {}
  getAccessTokenSilently() {
    return of('fake-access-token');
  }

}

const fakeClient: Client = {
  blocked: false,
  created_at: "",
  email_verified: false,
  family_name: "",
  given_name: "",
  identities: [],
  last_ip: "",
  last_login: "",
  logins_count: 0,
  name: "",
  nickname: "",
  picture: "",
  updated_at: "",
  user_id: "",
  email: 'test@example.com',
  billing_info: {
    company_name: 'None',
    cui: 'None',
    registration_number: 'None',
    iban: 'RO12ABCD12345678901234',
    phone_number: '0712345678',
    name: 'Test Holder',
    clientType: 'fizica',
    firstName: 'Test',
    lastName: 'User',
    cnp: '1234567890123',
    judet: 'Test Judet',
    oras: 'Test Oras',
    adresa: 'Test Adresa',
    id: 0,
    email: 'test@example.com',
    contract_number: '',
    discounts: []
  }
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let httpTestingController: HttpTestingController;

  // Configure the testing module:
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent, FormsModule, HttpClientTestingModule],
      providers: [
        ClientService,
        { provide: AuthService, useClass: FakeAuthService }
      ]
    }).compileComponents();
  }));

  // Create the component and initialize client so that the template doesn't try to subscribe or read undefined
  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    // Pre-set client so that the template can safely bind to client.billing_info
    component.client = fakeClient;

    // Now trigger ngOnInit() and initial change detection.
    fixture.detectChanges();
    tick();

    // Expect the GET request and flush it.
    const req = httpTestingController.expectOne((request) =>
      request.method === 'GET' && request.url.indexOf('/api/client') !== -1
    );
    req.flush(fakeClient);
    tick();

    fixture.detectChanges();
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle edit mode', () => {
    expect(component.editMode).toBeFalse();
    component.toggleEditMode();
    fixture.detectChanges();
    expect(component.editMode).toBeTrue();
    component.toggleEditMode();
    fixture.detectChanges();
    expect(component.editMode).toBeFalse();
  });

  it('should update billing_info.clientType when onClientTypeChange is called', () => {
    // Start with "fizica"
    component.clientType = 'fizica';
    component.client.billing_info.clientType = 'fizica';
    // Change to "juridica"
    component.clientType = 'juridica';
    component.onClientTypeChange();
    fixture.detectChanges();
    expect(component.client.billing_info.clientType).toEqual('juridica');
  });

  it('should show error messages for "persoana juridica" when required fields are missing', () => {
    component.toggleEditMode();
    fixture.detectChanges();
    component.clientType = 'juridica';
    component.onClientTypeChange();
    fixture.detectChanges();

    // Clear required juridica fields
    component.client.billing_info.company_name = '';
    component.client.billing_info.cui = '';
    component.client.billing_info.registration_number = '';
    component.client.billing_info.iban = '';

    component.saveProfile();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBeGreaterThan(0);
    expect(component.errorMessages[0]).toContain('persoana juridica');
  });

  it('should show error messages for "persoana fizica" when required fields are missing', () => {
    component.toggleEditMode();
    fixture.detectChanges();
    component.clientType = 'fizica';
    component.onClientTypeChange();
    fixture.detectChanges();

    // Clear required fizica fields
    component.client.billing_info.firstName = '';
    component.client.billing_info.lastName = '';
    component.client.billing_info.cnp = '';
    component.client.billing_info.judet = '';
    component.client.billing_info.oras = '';
    component.client.billing_info.adresa = '';
    component.client.billing_info.iban = '';

    component.saveProfile();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBeGreaterThan(0);
    expect(component.errorMessages[0]).toContain('persoana fizica');
  });

  it('should save profile with valid "persoana juridica" data and handle success response', fakeAsync(() => {
    component.toggleEditMode();
    fixture.detectChanges();
    component.clientType = 'juridica';
    component.onClientTypeChange();
    fixture.detectChanges();

    // Set valid juridica data
    component.client.billing_info.company_name = 'Test Company';
    component.client.billing_info.cui = 'RO123456';
    component.client.billing_info.registration_number = 'J12/345/6789';
    component.client.billing_info.iban = 'RO12ABCD12345678901234';
    component.client.billing_info.phone_number = '0712345678';
    component.client.billing_info.name = 'Test Holder';

    component.saveProfile();
    tick();
    fixture.detectChanges();

    // Use a matcher function to ignore host differences.
    const putReq = httpTestingController.expectOne(req =>
      req.method === 'PUT' &&
      req.url.indexOf('/api/client/modify-billingInfo') !== -1 &&
      req.url.indexOf('email=test@example.com') !== -1
    );
    expect(putReq.request.method).toEqual('PUT');
    putReq.flush({ message: 'Billing info modified successfully' });
    tick();
    fixture.detectChanges();
    expect(component.successMessage).toEqual('Date salvate cu succes.');
    expect(component.editMode).toBeFalse();
  }));

  it('should handle HTTP error when saving profile', fakeAsync(() => {
    component.toggleEditMode();
    fixture.detectChanges();
    component.clientType = 'fizica';
    component.onClientTypeChange();
    fixture.detectChanges();

    // Set valid fizica data
    component.client.billing_info.firstName = 'John';
    component.client.billing_info.lastName = 'Doe';
    component.client.billing_info.cnp = '1234567890123';
    component.client.billing_info.judet = 'Bucuresti';
    component.client.billing_info.oras = 'Bucuresti';
    component.client.billing_info.adresa = 'Str. Exemplu nr.1';
    component.client.billing_info.iban = 'RO12ABCD12345678901234';
    component.client.billing_info.phone_number = '0712345678';
    component.client.billing_info.name = 'John Doe';

    component.saveProfile();
    tick();
    fixture.detectChanges();

    const putReq = httpTestingController.expectOne(req =>
      req.method === 'PUT' &&
      req.url.indexOf('/api/client/modify-billingInfo') !== -1 &&
      req.url.indexOf('email=test@example.com') !== -1
    );
    expect(putReq.request.method).toEqual('PUT');
    // Simulate backend error with validation message (e.g. invalid CUI)
    putReq.flush({ cui: 'CUI invalid' }, { status: 400, statusText: 'Bad Request' });
    tick();
    fixture.detectChanges();
    expect(component.errorMessages).toContain('CUI invalid');
  }));

  // Optionally, you can test logout if needed.
  // it('should call logout method when logout is triggered', () => {
  //   const auth = TestBed.inject(AuthService) as FakeAuthService;
  //   spyOn(auth, 'logout');
  //   component.logout();
  //   fixture.detectChanges();
  //   expect(auth.logout).toHaveBeenCalled();
  // });
});
