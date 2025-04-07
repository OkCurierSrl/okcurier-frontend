import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LockerService } from '../../../services/locker.service';
import {of, Subscription} from "rxjs";
import {catchError, finalize} from "rxjs/operators";

declare const google: any;

@Component({
  selector: 'app-locker-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './locker-selector.component.html',
  styleUrl: './locker-selector.component.css'
})
export class LockerSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() useLocker: boolean = false;
  @Input() selectedCourier: string = '';
  @Output() lockerSelected = new EventEmitter<{ lockerId: string, courier: string }>();

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map: any;
  markers: any[] = [];
  lockers: any[] = [];
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  selectedLockerId: string = '';
  selectedLocker: any = null;
  private subscriptions = new Subscription();

  constructor(private lockerService: LockerService) {}

  ngOnInit(): void {
    // If we already have a selected courier, load lockers
    if (this.selectedCourier) {
      this.loadLockersByCourier(this.selectedCourier);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the selected courier changes, reload lockers
    if (changes['selectedCourier'] && !changes['selectedCourier'].firstChange) {
      // Reset selected locker when courier changes
      this.selectedLockerId = '';
      this.selectedLocker = null;
      this.loadLockersByCourier(this.selectedCourier);
    }

    // If useLocker changes to true, initialize the map
    if (changes['useLocker'] && this.useLocker && this.mapContainer) {
      setTimeout(() => this.initMap(), 100); // Small delay to ensure the DOM is ready
    } else if (changes['useLocker'] && !this.useLocker) {
      // Reset selected locker when useLocker is set to false
      this.selectedLockerId = '';
      this.selectedLocker = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Clean up markers
    this.clearMarkers();
  }

  initMap(): void {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.error('Google Maps API not loaded');
      this.hasError = true;
      this.errorMessage = 'Google Maps could not be loaded. Please refresh the page and try again.';
      return;
    }

    try {
      // Default center on Romania
      const center = { lat: 45.9443, lng: 25.0094 };

      // Create the map
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 7,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      // If we have lockers, add markers
      if (this.lockers.length > 0) {
        this.addMarkersToMap();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      this.hasError = true;
      this.errorMessage = 'Error initializing map. Please try again.';
    }
  }

  loadLockersByCourier(courier: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const subscription = this.lockerService.getLockersByCourier(courier)
      .pipe(
        catchError(error => {
          this.hasError = true;
          this.errorMessage = 'Failed to load lockers. Please try again.';
          console.error('Error loading lockers:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(lockers => {
        this.lockers = lockers;

        // If map is initialized, add markers
        if (this.map) {
          this.clearMarkers();
          this.addMarkersToMap();
        } else if (this.mapContainer) {
          // Initialize map if container exists but map doesn't
          this.initMap();
        }
      });

    this.subscriptions.add(subscription);
  }

  addMarkersToMap(): void {
    this.clearMarkers();

    this.lockers.forEach(locker => {
      const position = {
        lat: locker.coordinates ? locker.coordinates.lat : locker.lat,
        lng: locker.coordinates ? locker.coordinates.lng : locker.lng
      };

      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: locker.name,
        icon: {
          url: this.getMarkerIcon(locker.courier),
          scaledSize: new google.maps.Size(30, 30)
        }
      });

      // Create info window content
      const contentString = `
        <div class="locker-info">
          <h3>${locker.name}</h3>
          <p>${locker.address}</p>
          <p><strong>Courier:</strong> ${locker.courier}</p>
          <p><strong>ID:</strong> ${locker.id}</p>
          <button id="select-locker-${locker.id}" class="select-locker-btn">Select this locker</button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all other info windows first
        this.markers.forEach(m => m.infoWindow.close());

        // Open this info window
        infoWindow.open(this.map, marker);

        // Add event listener to the select button after the info window is opened
        setTimeout(() => {
          const selectButton = document.getElementById(`select-locker-${locker.id}`);
          if (selectButton) {
            selectButton.addEventListener('click', () => {
              this.selectLocker(locker);
              infoWindow.close();
            });
          }
        }, 100);
      });

      // Store marker and info window for later cleanup
      this.markers.push({ marker, infoWindow });
    });

    // Adjust map bounds to fit all markers if there are any
    if (this.markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      this.markers.forEach(m => bounds.extend(m.marker.getPosition()));
      this.map.fitBounds(bounds);
    }
  }

  clearMarkers(): void {
    // Remove all markers from the map and clear the array
    this.markers.forEach(m => {
      m.infoWindow.close();
      m.marker.setMap(null);
    });
    this.markers = [];
  }

  selectLocker(locker: any): void {
    this.selectedLockerId = locker.id;
    // Store the selected locker for display
    this.selectedLocker = locker;
    // Emit the event to the parent component
    this.lockerSelected.emit({
      lockerId: locker.id,
      courier: locker.courier
    });
    console.log('Locker selected:', locker);
  }

  getMarkerIcon(courier: string): string {
    // Return appropriate icon based on courier
    switch (courier.toLowerCase()) {
      case 'dpd': return 'assets/dpd-logo.png';
      case 'cargus': return 'assets/cargus-logo.png';
      case 'sameday': return 'assets/sameday-logo.png';
      case 'gls': return 'assets/gls-logo.png';
      default: return 'assets/logo.png';
    }
  }
}
