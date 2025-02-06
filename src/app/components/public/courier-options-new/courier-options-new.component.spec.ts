import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierOptionsNewComponent } from './courier-options-new.component';

describe('CourierOptionsNewComponent', () => {
  let component: CourierOptionsNewComponent;
  let fixture: ComponentFixture<CourierOptionsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourierOptionsNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierOptionsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
