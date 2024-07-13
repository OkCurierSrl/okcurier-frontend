import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierOptionsComponent } from './courier-options.component';

describe('CourierOptionsComponent', () => {
  let component: CourierOptionsComponent;
  let fixture: ComponentFixture<CourierOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourierOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
