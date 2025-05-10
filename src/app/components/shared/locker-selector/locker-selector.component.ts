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
  isMapLoading: boolean = true;
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
      this.isMapLoading = false;
      this.errorMessage = 'Google Maps could not be loaded. Please refresh the page and try again.';
      return;
    }

    // Set a timeout to ensure isMapLoading is set to false even if map loading fails
    setTimeout(() => {
      if (this.isMapLoading) {
        console.log('Map loading timeout reached, forcing loading state to complete');
        this.isMapLoading = false;
      }
    }, 10000); // 10 seconds timeout

    try {
      // Default center on Romania
      const center = { lat: 45.9443, lng: 25.0094 };

      // Create the map with optimized settings
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 7,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        maxZoom: 15,
        minZoom: 5
      });

      // Add a listener for when the map is idle (fully loaded)
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        console.log('Map fully loaded');
        this.isMapLoading = false;
        // If we have lockers, add markers
        if (this.lockers.length > 0) {
          this.addMarkersToMap();
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      this.hasError = true;
      this.isMapLoading = false;
      this.errorMessage = 'Error initializing map. Please try again.';
    }
  }

  loadLockersByCourier(courier: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('Loading lockers for courier:', courier);

    // Initialize map first if it doesn't exist
    if (!this.map && this.mapContainer) {
      this.initMap();
    }

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
        console.log(`Received ${lockers.length} lockers for ${courier}`);
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
    console.log('Adding markers to map...');
    this.clearMarkers();

    // Create bounds object to fit all markers
    const bounds = new google.maps.LatLngBounds();

    // Batch marker creation for better performance
    const batchSize = 10;
    const totalLockers = this.lockers.length;

    // Function to add markers in batches
    const addMarkerBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, totalLockers);

      for (let i = startIndex; i < endIndex; i++) {
        const locker = this.lockers[i];
        const position = {
          lat: locker.coordinates ? locker.coordinates.lat : locker.lat,
          lng: locker.coordinates ? locker.coordinates.lng : locker.lng
        };

        // Extend bounds with this position
        bounds.extend(position);

        // Create marker with optimized settings
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: locker.name,
          animation: google.maps.Animation.DROP,
          optimized: true,
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

        // Create info window but don't open it yet
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
      }

      // If there are more markers to add, schedule the next batch
      if (endIndex < totalLockers) {
        setTimeout(() => addMarkerBatch(endIndex), 50);
      } else {
        // All markers added, now fit bounds
        if (this.markers.length > 0) {
          this.map.fitBounds(bounds);
          // Limit zoom level to prevent excessive zoom on single marker
          google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
            if (this.map.getZoom() > 15) this.map.setZoom(15);
          });
        }
        console.log('All markers added to map');
      }
    };

    // Start adding markers in batches
    if (totalLockers > 0) {
      addMarkerBatch(0);
    } else {
      console.log('No lockers to add to map');
    }
  }

  clearMarkers(): void {
    // Remove all markers from the map and clear the array
    if (this.markers.length > 0) {
      console.log(`Clearing ${this.markers.length} markers`);
      this.markers.forEach(m => {
        m.infoWindow.close();
        m.marker.setMap(null);
      });
      this.markers = [];
    }
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
