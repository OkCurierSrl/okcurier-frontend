import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

interface Locker {
  id: string;
  name: string;
  address: string;
  courier: string;
}

@Component({
  selector: 'app-locker-selector',
  standalone: true,
  imports: [CommonModule, DropdownModule, DialogModule, ButtonModule, FormsModule],
  template: `
    <div class="locker-selection">
      <p-dropdown
        [options]="couriers"
        [(ngModel)]="selectedCourier"
        (onChange)="onCourierChange()"
        placeholder="Select Courier"
        [disabled]="!useLocker"
      ></p-dropdown>

      <p-dialog 
        header="Select Locker" 
        [(visible)]="showLockerMap" 
        [modal]="true"
        [style]="{width: '50vw'}"
      >
        <div class="locker-map">
          <!-- Here you would integrate your map component -->
          <div *ngFor="let locker of availableLockers" 
               class="locker-item" 
               (click)="selectLocker(locker)">
            <img [src]="'assets/' + locker.courier.toLowerCase() + '-logo.png'" 
                 [alt]="locker.courier + ' logo'" 
                 class="courier-logo">
            <div class="locker-info">
              <h4>{{locker.name}}</h4>
              <p>{{locker.address}}</p>
            </div>
          </div>
        </div>
      </p-dialog>

      <div *ngIf="selectedLocker" class="selected-locker-info">
        <h5>Selected Locker:</h5>
        <p>{{selectedLocker.name}} - {{selectedLocker.address}}</p>
      </div>
    </div>
  `,
  styles: [`
    .locker-selection {
      margin: 1rem 0;
    }
    .locker-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ddd;
      margin: 0.5rem 0;
      cursor: pointer;
    }
    .locker-item:hover {
      background-color: #f5f5f5;
    }
    .courier-logo {
      width: 50px;
      margin-right: 1rem;
    }
    .locker-info {
      flex: 1;
    }
    .selected-locker-info {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class LockerSelectorComponent implements OnInit {
  @Input() useLocker: boolean = false;
  @Output() lockerSelected = new EventEmitter<{ lockerId: string, courier: string }>();

  couriers = [
    { label: 'DPD', value: 'DPD' },
    { label: 'Cargus', value: 'CARGUS' },
    { label: 'Sameday', value: 'SAMEDAY' },
    { label: 'GLS', value: 'GLS' }
  ];

  selectedCourier: string | null = null;
  showLockerMap: boolean = false;
  selectedLocker: Locker | null = null;
  availableLockers: Locker[] = [];

  constructor() {}

  ngOnInit() {}

  onCourierChange() {
    if (this.selectedCourier) {
      this.showLockerMap = true;
      // Here you would typically call your API to get lockers for the selected courier
      this.loadLockers(this.selectedCourier);
    }
  }

  loadLockers(courier: string) {
    // Mock data - replace with actual API call
    this.availableLockers = [
      {
        id: `${courier}-LOCKER-123`,
        name: 'Central Locker',
        address: '123 Main St',
        courier: courier
      },
      {
        id: `${courier}-LOCKER-456`,
        name: 'Mall Locker',
        address: '456 Shopping Ave',
        courier: courier
      }
    ];
  }

  selectLocker(locker: Locker) {
    this.selectedLocker = locker;
    this.showLockerMap = false;
    this.lockerSelected.emit({ lockerId: locker.id, courier: locker.courier });
  }
}