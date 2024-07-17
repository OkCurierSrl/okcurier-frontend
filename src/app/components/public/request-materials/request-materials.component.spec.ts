import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMaterialsComponent } from './request-materials.component';

describe('RequestMaterialsComponent', () => {
  let component: RequestMaterialsComponent;
  let fixture: ComponentFixture<RequestMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestMaterialsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
