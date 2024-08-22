import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleResolverComponent } from './role-resolver.component';

describe('RoleResolverComponent', () => {
  let component: RoleResolverComponent;
  let fixture: ComponentFixture<RoleResolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleResolverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
