import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SavedAddressesComponent } from './saved-addresses.component';
import {BehaviorSubject, Observable, of} from "rxjs";
import {OrderService} from "../../../services/order.service";
import {Address} from "../../../model/address";
import {AuthService} from "@auth0/auth0-angular";

/** Stub for <app-order-form> */
@Component({
  selector: 'app-order-form',
  template: '<div>Order Form Stub - {{ title }}</div>'
})
class OrderFormStubComponent {
  @Input() title: string;
  @Output() formValidityChange = new EventEmitter<boolean>();
}

class FakeAuthService {
  user$ = new BehaviorSubject<any>({
    name: 'Test User',
    email: 'test@example.com'
  });

  logout() {
  }

  getAccessTokenSilently() {
    return of('fake-access-token');
  }
}

/** Stub for OrderService */
class FakeOrderService {
  // Add any necessary methods used by the component.
  // For example, if the component calls getOrders():
  getOrders() {
    return of([]); // returns an empty array as an observable
  }

  getAddresses(): Observable<Address[]> {
    const address: Address[] = [{
      city: "Bucuresti", county: "Romania", name: "Alex", number: "22", phone1: "0731446895",
      postalCode: "031755", shortName: "bucuresti", street: "camil ressu"
    }]
    return of(address);
  }
}

/** Stub for <app-table> */
@Component({
  selector: 'app-table',
  template: '<div>Table Stub</div>'
})
class TableStubComponent {}

describe('SavedAddressesComponent', () => {
  let component: SavedAddressesComponent;
  let fixture: ComponentFixture<SavedAddressesComponent>;

  beforeAll(() => {
    (window as any).google = {
      maps: {
        Marker: function() {},
        Map: function() {},
        Geocoder: function() {
          // Optionally return an object with a dummy geocode method
          return {
            geocode: (request: any, callback: Function) => callback([], 'OK')
          };
        }
      }
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SavedAddressesComponent, FormsModule],
      declarations: [OrderFormStubComponent, TableStubComponent],
      providers: [
        { provide: OrderService, useClass: FakeOrderService },
        { provide: AuthService, useClass: FakeAuthService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedAddressesComponent);
    component = fixture.componentInstance;
    // Set any default values required by the template
    component.shortName = 'Initial Short Name';
    component.successMessage = '';
    // For testing, override isFormValid to return a value (we can override per test)
    spyOn(component, 'isFormValid').and.callFake(() => true);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display success message in a fixed, centered div when successMessage is set', () => {
    component.successMessage = 'Address saved successfully!';
    fixture.detectChanges();
    const successDiv = fixture.debugElement.query(By.css('.success-message'));
    expect(successDiv).toBeTruthy();
    expect(successDiv.nativeElement.textContent).toContain('Address saved successfully!');
  });

  it('should disable the submit button when isFormValid returns false', () => {
    (component.isFormValid as jasmine.Spy).and.returnValue(false);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.arrow-button');
    expect(button.disabled).toBeTrue();
  });

  it('should enable the submit button when isFormValid returns true', () => {
    (component.isFormValid as jasmine.Spy).and.returnValue(true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.arrow-button');
    expect(button.disabled).toBeFalse();
  });

  it('should call onSubmit when the submit button is clicked', () => {
    spyOn(component, 'onSubmit');
    (component.isFormValid as jasmine.Spy).and.returnValue(true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.arrow-button');
    button.click();
    fixture.detectChanges();
    expect(component.onSubmit).toHaveBeenCalled();
  });
});
