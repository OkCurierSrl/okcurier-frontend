import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierOptionsPublicComponent } from './courier-options-public.component';

describe('CourierOptionsComponent', () => {
  let component: CourierOptionsPublicComponent;
  let fixture: ComponentFixture<CourierOptionsPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourierOptionsPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourierOptionsPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
