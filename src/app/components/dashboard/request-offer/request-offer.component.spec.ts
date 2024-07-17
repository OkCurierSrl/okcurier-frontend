import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestOfferComponent } from './request-offer.component';

describe('RequestOfferComponent', () => {
  let component: RequestOfferComponent;
  let fixture: ComponentFixture<RequestOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestOfferComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
