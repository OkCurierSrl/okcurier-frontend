import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { OrderFormComponent } from './order-form.component';
import { PlacesService } from '../../../../services/places.service';
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '@auth0/auth0-angular';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let mockPlacesService: jasmine.SpyObj<PlacesService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockPlacesService = jasmine.createSpyObj('PlacesService', ['getCounties', 'getCities', 'getPostalCode']);
    mockOrderService = jasmine.createSpyObj('OrderService', ['getAddresses']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user$: of(null)
    });

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PlacesService, useValue: mockPlacesService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();
    
    // Mock the services
    mockPlacesService.getCounties.and.returnValue(of([
      { stateName: 'București', stateCode: 'B' },
      { stateName: 'Cluj', stateCode: 'CJ' }
    ]));
    mockPlacesService.getCities.and.returnValue(of(['București', 'Sector 1', 'Sector 2']));
    mockOrderService.getAddresses.and.returnValue(of([]));
    
    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear city selection when county changes', () => {
    // Set initial values
    component.orderForm.get('county')?.setValue('Cluj');
    component.orderForm.get('city')?.setValue('Cluj-Napoca');
    
    // Change county
    component.onCountyChange({ target: { value: 'București' } });
    
    // City should be cleared
    expect(component.orderForm.get('city')?.value).toBe('');
  });

  it('should load cities when county changes', () => {
    const testCities = ['București', 'Sector 1', 'Sector 2', 'Sector 3'];
    mockPlacesService.getCities.and.returnValue(of(testCities));
    
    component.onCountyChange({ target: { value: 'București' } });
    
    expect(mockPlacesService.getCities).toHaveBeenCalledWith('București');
    expect(component.cities).toEqual(testCities);
  });

  it('should handle București county selection correctly', () => {
    const bucurestiiCities = ['București', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'];
    mockPlacesService.getCities.and.returnValue(of(bucurestiiCities));
    
    // Simulate selecting București county
    component.orderForm.get('county')?.setValue('București');
    
    // Verify that the correct cities are loaded
    expect(component.cities).toEqual(bucurestiiCities);
  });

  it('should not show cities from other counties when București is selected', () => {
    const bucurestiiCities = ['București', 'Sector 1', 'Sector 2'];
    const clujCities = ['Cluj-Napoca', 'Dej', 'Turda'];
    
    // First select Cluj
    mockPlacesService.getCities.and.returnValue(of(clujCities));
    component.onCountyChange({ target: { value: 'Cluj' } });
    expect(component.cities).toEqual(clujCities);
    
    // Then select București
    mockPlacesService.getCities.and.returnValue(of(bucurestiiCities));
    component.onCountyChange({ target: { value: 'București' } });
    expect(component.cities).toEqual(bucurestiiCities);
    expect(component.cities).not.toContain('Cluj-Napoca');
  });

  it('should log the number of cities loaded', () => {
    spyOn(console, 'log');
    const testCities = ['City1', 'City2', 'City3'];
    mockPlacesService.getCities.and.returnValue(of(testCities));
    
    component.onCountyChange({ target: { value: 'TestCounty' } });
    
    expect(console.log).toHaveBeenCalledWith('Loaded 3 cities for county: TestCounty');
  });
});
