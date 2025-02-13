// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import {getTestBed, TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {of} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {InjectionToken} from "@angular/core";
import {AuthService} from "@auth0/auth0-angular";
const mockAuth0Client = {
  // Add mock functions here if needed
  loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
  logout: jasmine.createSpy('logout'),
  getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({})),
  getAccessTokenSilently: jasmine.createSpy('getAccessTokenSilently').and.returnValue(of('fake-access-token')),
};


TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Set up global providers
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule // Provides HttpClient globally in tests
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { params: of({ id: '123' }) } // Mock ActivatedRoute globally
      },
      {
        provide: MatDialogRef,
        useValue: {} // Mock MatDialogRef globally
      },
      {
        provide: AuthService, // use the imported token
        useValue: mockAuth0Client, // Provide mock implementation
      }

    ]
  }).compileComponents();
});
