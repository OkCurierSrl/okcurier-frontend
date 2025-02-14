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
    fixture.detectChanges(); // declanșează ngOnInit și abonările
  });

  it('should set query parameters correctly', waitForAsync(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.amount).toBe(100);
      expect(component.description).toBe('Test Payment');
      expect(component.email).toBe('test@example.com');
      expect(component.courier).toBe('DPD');
      expect(component.orderData).toEqual(sampleOrderData);
    });
  }));

  it('should handle successful payment with /dashboard endpoint', fakeAsync(() => {
    // Valorile sunt preluate din queryParams, dar le setăm manual pentru siguranță
    component.amount = 100;
    component.email = 'test@example.com';
    component.orderData = sampleOrderData;
    component.courier = 'DPD';

    // Setăm stripe și card
    component.stripe = mockStripeService.getStripe();
    component.card = {};

    // Asumăm că router.url este '/dashboard'
    mockRouter.url = '/dashboard';

    component.handlePayment();
    tick(); // procesează promisiunile

    expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(100, 'test@example.com', 'ron');
    expect(mockOrderService.placeOrder).toHaveBeenCalledWith(sampleOrderData, 'DPD', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/track/AWB123']);
  }));

  it('should handle successful payment with /admin endpoint', fakeAsync(() => {
    // Modificăm router.url pentru a simula un context de admin
    mockRouter.url = '/admin';

    // Resetăm eventualele apeluri anterioare
    (mockOrderService.placeOrder as jasmine.Spy).calls.reset();
    (mockRouter.navigate as jasmine.Spy).calls.reset();

    // Setăm valorile necesare
    component.amount = 100;
    component.email = 'test@example.com';
    component.orderData = sampleOrderData;
    component.courier = 'DPD';
    component.stripe = mockStripeService.getStripe();
    component.card = {};

    component.handlePayment();
    tick();

    expect(mockOrderService.placeOrder).toHaveBeenCalledWith(sampleOrderData, 'DPD', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/track/AWB123']);
  }));

  it('should handle successful payment with fallback endpoint', fakeAsync(() => {
    // Simulăm un URL care nu începe cu '/dashboard' sau '/admin'
    mockRouter.url = '/other';

    // Resetăm apelurile
    (mockOrderService.placeOrder as jasmine.Spy).calls.reset();
    (mockRouter.navigate as jasmine.Spy).calls.reset();

    // Setăm valorile necesare
    component.amount = 100;
    component.email = 'test@example.com';
    component.orderData = sampleOrderData;
    component.courier = 'DPD';
    component.stripe = mockStripeService.getStripe();
    component.card = {};

    component.handlePayment();
    tick();

    expect(mockOrderService.placeOrder).toHaveBeenCalledWith(sampleOrderData, 'DPD', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/track/AWB123']);
  }));

  it('should handle payment error', fakeAsync(() => {
    component.stripe = mockStripeService.getStripe();
    component.card = {};

    // Forțăm ca confirmCardPayment să returneze o eroare
    (component.stripe.confirmCardPayment as jasmine.Spy).and.returnValue(
      Promise.resolve({ error: { message: 'Payment failed' } })
    );

    component.handlePayment();
    tick();

    expect(component.error).toBe('Payment failed');
  }));
});
