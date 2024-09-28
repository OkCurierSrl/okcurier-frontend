import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListRecheckedComponent } from './order-list-rechecked.component';

describe('OrderListComponent', () => {
  let component: OrderListRecheckedComponent;
  let fixture: ComponentFixture<OrderListRecheckedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListRecheckedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderListRecheckedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
