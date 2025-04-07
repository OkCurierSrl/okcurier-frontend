import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LockerService, Locker } from './locker.service';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

describe('LockerService', () => {
  let service: LockerService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getAccessTokenSilently']);
    authServiceMock.getAccessTokenSilently.and.returnValue(of('mock-token'));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LockerService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(LockerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLockersByCourier', () => {
    it('should get lockers by courier with auth headers', () => {
      const mockLockers: Locker[] = [
        {
          id: 'DPD-001',
          name: 'DPD Locker Test',
          address: 'Test Address',
          courier: 'DPD',
          coordinates: { lat: 44.4377401, lng: 26.0946235 }
        }
      ];

      service.getLockersByCourier('DPD').subscribe(lockers => {
        expect(lockers).toEqual(mockLockers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lockers/DPD`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockLockers);
    });

    it('should get lockers by courier without auth headers when useAuth is false', () => {
      const mockLockers: Locker[] = [
        {
          id: 'DPD-001',
          name: 'DPD Locker Test',
          address: 'Test Address',
          courier: 'DPD',
          coordinates: { lat: 44.4377401, lng: 26.0946235 }
        }
      ];

      service.getLockersByCourier('DPD', false).subscribe(lockers => {
        expect(lockers).toEqual(mockLockers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lockers/DPD`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush(mockLockers);
    });
  });

  describe('getLockerById', () => {
    it('should get locker by ID with auth headers', () => {
      const mockLocker: Locker = {
        id: 'DPD-001',
        name: 'DPD Locker Test',
        address: 'Test Address',
        courier: 'DPD',
        coordinates: { lat: 44.4377401, lng: 26.0946235 }
      };

      service.getLockerById('DPD-001').subscribe(locker => {
        expect(locker).toEqual(mockLocker);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lockers/locker/DPD-001`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockLocker);
    });

    it('should get locker by ID without auth headers when useAuth is false', () => {
      const mockLocker: Locker = {
        id: 'DPD-001',
        name: 'DPD Locker Test',
        address: 'Test Address',
        courier: 'DPD',
        coordinates: { lat: 44.4377401, lng: 26.0946235 }
      };

      service.getLockerById('DPD-001', false).subscribe(locker => {
        expect(locker).toEqual(mockLocker);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lockers/locker/DPD-001`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush(mockLocker);
    });
  });
});
