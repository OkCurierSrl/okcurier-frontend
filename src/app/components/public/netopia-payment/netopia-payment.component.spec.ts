import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetopiaPaymentComponent } from './netopia-payment.component';

describe('NetopiaPaymentComponent', () => {
  let component: NetopiaPaymentComponent;
  let fixture: ComponentFixture<NetopiaPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetopiaPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NetopiaPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
