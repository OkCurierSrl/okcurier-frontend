import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { PaymentPortalComponent } from './payment-portal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { StripeService } from '../../../services/stripe.service';
import { OrderService } from '../../../services/order.service';
import { DownloadService } from '../../../services/download.service';

// Obiectul OrderData complet, cu adrese conform interfeței Address
const sampleOrderData = {
  email: 'test@example.com',
  expeditor: {
    shortName: 'Expeditor',
    name: 'Firma Expeditor',
    phone1: '0123456789',
    county: 'București',
    city: 'București',
    street: 'Str. Expeditor 1',
    number: '1',
    postalCode: '010101'
  },
  destinatar: {
    shortName: 'Destinatar',
    name: 'Firma Destinatar',
    phone1: '0987654321',
    county: 'Cluj',
    city: 'Cluj-Napoca',
    street: 'Str. Destinatar 2',
    number: '2',
    postalCode: '020202'
  },
  pickupDate: new Date('2025-03-01'),
  price: 100,
  packages: [
    { length: 10, width: 10, height: 10, weight: 1 }
  ],
  extraServices: {
    returColetNelivrat: true,
    documentSchimb: false,
    coletSchimb: false,
    deschidereColet: false,
    asigurare: 100,
    transportRamburs: false,
    rambursCont: 0
  },
  isPlicSelected: false,
  iban: 'RO49AAAA1B31007593840000',
  detinatorIban: 'Test User'
};

describe('PaymentPortalComponent', () => {
  let component: PaymentPortalComponent;
  let fixture: ComponentFixture<PaymentPortalComponent>;

  // Mock pentru ActivatedRoute cu queryParams actualizat
  const mockActivatedRoute = {
    queryParams: of({
      amount: 100,
      description: 'Test Payment',
      email: 'test@example.com',
      courier: 'DPD',
      orderData: sampleOrderData,
    }),
  };

  // Mock pentru Router cu proprietatea url setată
  const mockRouter = {
    url: '/dashboard', // valoare implicită; o vom modifica în teste pentru diferite scenarii
    navigate: jasmine.createSpy('navigate'),
  };

  // Mock pentru StripeService cu metodele necesare
  const mockStripeService = {
    initializeStripe: jasmine.createSpy('initializeStripe').and.resolveTo({}),
    getStripe: jasmine.createSpy('getStripe').and.returnValue({
      elements: jasmine.createSpy('elements').and.returnValue({
        create: jasmine.createSpy('create').and.returnValue({
          mount: jasmine.createSpy('mount'),
          on: jasmine.createSpy('on'),
        }),
      }),
      confirmCardPayment: jasmine.createSpy('confirmCardPayment')
        .and.returnValue(Promise.resolve({ error: null })),
    }),
    createPaymentIntent: jasmine.createSpy('createPaymentIntent')
      .and.returnValue(Promise.resolve({ clientSecret: 'mocked-client-secret' })),
  };

  // Mock pentru OrderService
  const mockOrderService = {
    placeOrder: jasmine.createSpy('placeOrder').and.returnValue(of({ awb: 'AWB123' })),
  };

  // Mock pentru DownloadService
  const mockDownloadService = {
    downloadLabel: jasmine.createSpy('downloadLabel'),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PaymentPortalComponent], // componenta este standalone
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: StripeService, useValue: mockStripeService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: DownloadService, useValue: mockDownloadService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit, which subscribes to queryParams
  });

  it('should set query parameters correctly', waitForAsync(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges(); // ensure the component is updated with the latest data

      expect(component.amount).toBe(100);
      expect(component.description).toBe('Test Payment');
      expect(component.email).toBe('test@example.com');
      expect(component.courier).toBe('DPD');
      expect(component.orderData).toEqual(sampleOrderData);
    });
  }));
});
