import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockerSelectorComponent } from './locker-selector.component';

describe('LockerSelectorComponent', () => {
  let component: LockerSelectorComponent;
  let fixture: ComponentFixture<LockerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockerSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LockerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
