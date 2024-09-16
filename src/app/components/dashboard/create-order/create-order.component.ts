import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderFormComponent} from "./order-form/order-form.component";
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonDirective} from "primeng/button";
import {PackageFormComponent} from "./package-form/package-form.component";
import {PackageOverviewComponent} from "./package-overview/package-overview.component";
import {PriceCalculationService} from "../../../services/price-calculation.service";
import {Router} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";
import {Client} from "../../../model/client";
import {ClientService} from "../../../services/client.service";
import {OrderData} from "../../../model/order-data";


@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderFormComponent, InputTextModule, CheckboxModule, ButtonDirective, PackageFormComponent, FormsModule, PackageOverviewComponent],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit, AfterViewInit {
  @ViewChild('expeditorForm') expeditorFormComponent: OrderFormComponent;
  @ViewChild('destinatarForm') destinatarFormComponent: OrderFormComponent;
  @ViewChildren(PackageFormComponent) packageForms: QueryList<PackageFormComponent>;
  @ViewChildren(PackageOverviewComponent) packageOverviewComponents: QueryList<PackageOverviewComponent>;

  expeditorFormValid: boolean = false;
  destinatarFormValid: boolean = false;
  courierPackages: { form: FormGroup, valid: boolean }[] = [];
  extraServices: { label: string, value: string }[] = [
    {label: 'Retur', value: 'returColetNelivrat'},
    {label: 'Document la schimb', value: 'documentSchimb'},
    {label: 'Colet la schimb', value: 'coletSchimb'},
    {label: 'Deschidere Colet', value: 'deschidereColet'},
    {label: 'Asigurare', value: 'asigurare'},
    {label: 'Adauga pretul transportului in ramburs', value: 'transportRamburs'},
    {label: 'Ramburs in cont', value: 'rambursCont'},
  ];
  selectedServices: { [key: string]: boolean } = {};
  asigurare: number | null = 0;
  rambursCont: number | null = 0;
  isPlicSelected: boolean;
  private isLoggedIn: boolean;
  client: Client;
  isProfileComplete: boolean = true;
  private email: string;


  constructor(private fb: FormBuilder,
              private renderer: Renderer2,
              private el: ElementRef,
              private priceCalculationService: PriceCalculationService,
              private auth: AuthService,
              private clientService: ClientService,
              private router: Router) {
    this.auth.isAuthenticated$.subscribe((loggedIn, ) => {
        this.isLoggedIn = loggedIn;
    });
  }

  ngOnInit(): void {
    this.clientService.isProfileCompleted().subscribe(
      (isProfileCompleted: boolean) => {
        this.isProfileComplete = isProfileCompleted;
        if (!this.isProfileComplete) {
          this.greyOutThePageAndDisplayInfoInDiv();
        }
      },
      error => {
        console.error('Error fetching client data', error);
      }
    );

    this.addPackage(); // Initialize with one package
  }

  ngAfterViewInit(): void {
    this.setPackagesHeight();
  }

  onExpeditorFormValidityChange(isValid: boolean): void {
    this.expeditorFormValid = isValid;
    this.checkFormsValidity();
  }

  onDestinatarFormValidityChange(isValid: boolean): void {
    this.destinatarFormValid = isValid;
    this.checkFormsValidity();
  }

  onPackageValidityChange(index: number, isValid: boolean): void {
    this.courierPackages[index].valid = isValid;
    this.checkFormsValidity();
  }

  setPackagesHeight(): void {
    const expeditorFormColumn = this.el.nativeElement.querySelector('#expeditorFormColumn');
    const packageSection = this.el.nativeElement.querySelector('#packageSection');
    const packageOverview = this.el.nativeElement.querySelector('#packageOverview');

    if (expeditorFormColumn && packageSection && packageOverview) {
      const formHeight = expeditorFormColumn.offsetHeight - packageOverview.offsetHeight - 16; //1rem
      this.renderer.setStyle(packageSection, 'height', `${formHeight}px`);
      this.renderer.setStyle(packageSection.querySelector('.scrollable-content'), 'max-height', `${formHeight}px`);
    }
  }

  addPackage(): void {
    const packageForm = this.fb.group({
      length: [0, [Validators.required, Validators.min(1)]],
      width: [0, [Validators.required, Validators.min(1)]],
      height: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(1), Validators.max(31)]]
    });

    this.courierPackages.push({form: packageForm, valid: false});
    this.courierPackages = [...this.courierPackages]; // Trigger change detection
  }

  calculateOverview(): void {
    const totalPackages = this.courierPackages.length;
    const totalWeight = this.courierPackages.reduce((acc, pkg) => acc + (pkg.form.value.weight || 0), 0);

    // Emit the updated overview values
    const overviewComponent = this.packageOverviewComponents.first;
    if (overviewComponent) {
      overviewComponent.totalPackages = totalPackages;
      overviewComponent.totalWeight = totalWeight;
    }
  }

  onWeightChange(): void {
    setTimeout(() => this.calculateOverview(), 1);
  }

  onLengthChange() {
    setTimeout(() => this.calculateOverview(), 1);

  }

  onwWidthChange() {
    setTimeout(() => this.calculateOverview(), 1);

  }

  onHeightChange() {
    setTimeout(() => this.calculateOverview(), 1);

  }


  removePackage(index: number): void {
    this.courierPackages.splice(index, 1);
    this.courierPackages = [...this.courierPackages]; // Trigger change detection
    this.checkFormsValidity(); // Re-check validity after removing a package
  }

  toggleService(service: string): void {
    this.selectedServices[service] = !this.selectedServices[service];
    if (!this.selectedServices['asigurare']) {
      this.asigurare = null;
    }
    if (!this.selectedServices['rambursCont']) {
      this.rambursCont = null;
    }
  }

  get filteredExtraServices() {
    if (this.isPlicSelected) {
      return this.extraServices.filter(service => service.value !== 'rambursCont');
    }
    return this.extraServices;
  }

  checkFormsValidity(): void {
    // console.log('Expeditor form valid:', this.expeditorFormValid);
    // console.log('Destinatar form valid:', this.destinatarFormValid);
    // console.log('Package count:', this.courierPackages.length > 0);
    //
    // this.courierPackages.forEach((pkg, idx) => {
    //   console.log(`Package ${idx + 1} valid:`, pkg.valid);
    // });
  }

  isFormValid(): boolean {
    return this.expeditorFormValid && this.destinatarFormValid && (this.isPlicSelected || (this.courierPackages.length > 0 && this.courierPackages.every(pkg => pkg.valid)));
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const expeditorData = this.expeditorFormComponent.orderForm.getRawValue();
      const destinatarData = this.destinatarFormComponent.orderForm.getRawValue();
      const packagesData = this.courierPackages.map(pkg => pkg.form.getRawValue());

      const orderData: OrderData = {
        expeditor: expeditorData,
        destinatar: destinatarData,
        packages: this.isPlicSelected ? [] : packagesData,
        extraServices: {
          returColetNelivrat: this.selectedServices['returColetNelivrat'],
          documentSchimb: this.selectedServices['documentSchimb'],
          coletSchimb: this.selectedServices['coletSchimb'],
          deschidereColet: this.selectedServices['deschidereColet'],
          asigurare: this.asigurare,
          transportRamburs: this.selectedServices['transportRamburs'],
          rambursCont: this.isPlicSelected ? 0 : this.rambursCont,
        },
        isPlicSelected: this.isPlicSelected,
      };

      // Log the payload for debugging
      console.log('Submitting order data:', JSON.stringify(orderData, null, 2));

      this.priceCalculationService.getPrices(orderData).subscribe(
        (response) => {
          console.log('Order submitted successfully', response);
          let url: string;
          if (this.isLoggedIn) {
            url = '/dashboard/courier-options';
          } else {
            url = '/courier-options';
          }
          this.router.navigate([url],
            {
              queryParams: {
                couriers: JSON.stringify(response),
                orderData: JSON.stringify(orderData)
              }
            });
        });
    }
  }

  selectPlic(b: boolean) {
    this.isPlicSelected = b;
    if (!b) {
      this.addPackage()
    } else {
      this.courierPackages = []
    }
  }

  private greyOutThePageAndDisplayInfoInDiv() {
    // Create the overlay
    const overlay = this.renderer.createElement('div');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');
    this.renderer.setStyle(overlay, 'backgroundColor', 'rgba(0, 0, 0, 0.5)');
    this.renderer.setStyle(overlay, 'zIndex', '1000');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'alignItems', 'center');
    this.renderer.setStyle(overlay, 'justifyContent', 'center');

    // Create the info message box
    const infoDiv = this.renderer.createElement('div');
    this.renderer.setStyle(infoDiv, 'backgroundColor', '#fff');
    this.renderer.setStyle(infoDiv, 'padding', '20px');
    this.renderer.setStyle(infoDiv, 'borderRadius', '8px');
    this.renderer.setStyle(infoDiv, 'textAlign', 'center');
    this.renderer.setStyle(infoDiv, 'boxShadow', '0px 4px 10px rgba(0, 0, 0, 0.2)');

    const infoText = this.renderer.createText('Please complete your profile to send packages.');
    this.renderer.appendChild(infoDiv, infoText);

    // Create a button to go to the profile page
    const button = this.renderer.createElement('button');
    this.renderer.setStyle(button, 'marginTop', '10px');
    this.renderer.setStyle(button, 'padding', '10px 20px');
    this.renderer.setStyle(button, 'border', 'none');
    this.renderer.setStyle(button, 'backgroundColor', '#007bff');
    this.renderer.setStyle(button, 'color', '#fff');
    this.renderer.setStyle(button, 'borderRadius', '4px');
    this.renderer.setStyle(button, 'cursor', 'pointer');
    const buttonText = this.renderer.createText('Go to Profile');
    this.renderer.appendChild(button, buttonText);

    // Add click event listener to the button to navigate and remove the overlay
    this.renderer.listen(button, 'click', () => {
      this.router.navigate(['/dashboard/profile']).then(() => {
        // Remove the overlay after navigating
        this.renderer.removeChild(document.body, overlay);
      });
    });

    // Append the button and info message to the overlay
    this.renderer.appendChild(infoDiv, button);
    this.renderer.appendChild(overlay, infoDiv);

    // Append the overlay to the body
    this.renderer.appendChild(document.body, overlay);
  }
}
