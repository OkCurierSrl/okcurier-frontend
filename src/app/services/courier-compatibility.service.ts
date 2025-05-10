import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourierCompatibilityService {
  // Map of courier services compatibility
  private serviceCompatibility = {
    'DPD': {
      'deschidereColet': true,
      'coletSchimb': true,
      'documentSchimb': true,
      'asigurare': true,
      'rambursCont': true,
      'transportRamburs': true
    },
    'CARGUS': {
      'deschidereColet': true,
      'coletSchimb': true,
      'documentSchimb': true,
      'asigurare': true,
      'rambursCont': true,
      'transportRamburs': true
    },
    'SAMEDAY': {
      'deschidereColet': true,
      'coletSchimb': true,
      'documentSchimb': true,
      'asigurare': true,
      'rambursCont': true,
      'transportRamburs': true
    },
    'GLS': {
      'deschidereColet': false,
      'coletSchimb': true,
      'documentSchimb': true,
      'asigurare': true,
      'rambursCont': true,
      'transportRamburs': true
    }
  };

  constructor() { }

  /**
   * Check if a courier supports all the selected services
   * @param courier The courier to check
   * @param services The selected services
   * @returns true if the courier supports all services, false otherwise
   */
  isCourierCompatible(courier: string, services: any): boolean {
    // Normalize courier name to uppercase
    const courierName = courier.toUpperCase();

    // If courier is not in our compatibility map, assume it's compatible
    if (!this.serviceCompatibility[courierName]) {
      return true;
    }

    // Check each selected service
    for (const [service, isSelected] of Object.entries(services)) {
      // If service is selected and courier doesn't support it
      if (isSelected && this.serviceCompatibility[courierName][service] === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get a list of incompatible services for a courier
   * @param courier The courier to check
   * @returns Array of service names that are not supported
   */
  getIncompatibleServices(courier: string): string[] {
    const courierName = courier.toUpperCase();
    const incompatibleServices = [];

    if (!this.serviceCompatibility[courierName]) {
      return [];
    }

    for (const [service, isSupported] of Object.entries(this.serviceCompatibility[courierName])) {
      if (!isSupported) {
        incompatibleServices.push(service);
      }
    }

    return incompatibleServices;
  }
}
