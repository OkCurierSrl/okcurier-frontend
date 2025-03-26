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
import {auth} from "express-oauth2-jwt-bearer";
import {RoleService} from "../../../services/role-service.service";


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

  protected isLoggedIn: boolean;
  private isAdmin: boolean = false;

  expeditorFormValid: boolean = false;
  destinatarFormValid: boolean = false;

  courierPackages: { form: FormGroup, valid: boolean }[] = [];
  extraServices: { label: string, value: string }[] = [
    {label: 'Document la schimb', value: 'documentSchimb'},
    {label: 'Colet la schimb', value: 'coletSchimb'},
    {label: 'Deschidere Colet', value: 'deschidereColet'},
    {label: 'Asigurare', value: 'asigurare'},
    {label: 'Adauga pretul transportului in ramburs', value: 'transportRamburs'},
    {label: 'Ramburs in cont', value: 'rambursCont'},
  ];
  selectedServices: { [key: string]: boolean } = {};
  asigurare: number | null;
  rambursCont: number | null;
  isPlicSelected: boolean = false;
  client: Client;
  isProfileComplete: boolean = true;
  iban: any;
  detinatorIban: any;
  private email: string;

  constructor(private fb: FormBuilder,
              private renderer: Renderer2,
              private el: ElementRef,
              private priceCalculationService: PriceCalculationService,
              private auth: AuthService,
              private clientService: ClientService,
              private roleService: RoleService,
              private router: Router) {
  }

  ngOnInit(): void {
    // First, get authentication status
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;

      if (isAuthenticated) {
        // Get email first
        this.roleService.getEmail().subscribe(
          (email) => {
            this.email = email;

            // Only after we have the email, fetch client data
            this.clientService.getClientByEmail(this.email).subscribe(
              (client: Client) => {
                // Autocomplete IBAN fields if they exist and are not 'None'
                if (client.billing_info?.iban &&
                    client.billing_info.iban !== 'None' &&
                    client.billing_info.iban !== '') {
                  this.iban = client.billing_info.iban;
                }

                if (client.billing_info?.iban_name &&
                    client.billing_info.iban_name !== 'None' &&
                    client.billing_info.iban_name !== '') {
                  this.detinatorIban = client.billing_info.iban_name;
                }
              },
              (error) => {
                console.error('Error fetching client data', error);
              }
            );

            // Check profile completion
            this.clientService.isProfileCompleted().subscribe(
              (isProfileCompleted: boolean) => {
                this.isProfileComplete = isProfileCompleted;
                if (!this.isProfileComplete) {
                  this.greyOutThePageAndDisplayInfoInDiv();
                }
              },
              (error) => {
                console.error('Error checking profile completion', error);
              }
            );
          }
        );

        // Get admin role
        this.roleService.hasRequiredRole(['ADMIN']).subscribe((hasAdminRole) => {
          this.isAdmin = hasAdminRole;
        });
      } else {
        console.log('User is not authenticated. Skipping data fetching.');
      }
    });

    this.addPackage(); // Initialize with one package
  }

  ngAfterViewInit(): void {
    this.setPackagesHeight();
    this.onExpeditorFormValidityChange(this.expeditorFormComponent.orderForm.valid);
    this.onDestinatarFormValidityChange(this.destinatarFormComponent.orderForm.valid);
    this.isFormValid();
  }

  onExpeditorFormValidityChange(isValid: boolean): void {
    this.expeditorFormValid = isValid;
  }

  onDestinatarFormValidityChange(isValid: boolean): void {
    this.destinatarFormValid = isValid;
  }

  onPackageValidityChange(index: number, isValid: boolean): void {
    this.courierPackages[index].valid = isValid;
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
    if (this.courierPackages.length >= 10) {
      console.warn('Cannot add more than 10 packages');
      return;
    }

    const packageForm = this.fb.group({
      length: [0, [Validators.required, Validators.min(1)]],
      width: [0, [Validators.required, Validators.min(1)]],
      height: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(1), Validators.max(31)]]
    });


    this.courierPackages.push({form: packageForm, valid: false});
    this.courierPackages = [...this.courierPackages]; // Trigger change detection
  }

  removePackage(index: number): void {
    this.courierPackages.splice(index, 1);
    this.courierPackages = [...this.courierPackages]; // Trigger change detection
  }

  toggleService(service: string): void {
    if (service === 'documentSchimb' && this.selectedServices['coletSchimb']) {
      this.selectedServices['coletSchimb'] = false; // Uncheck 'coletSchimb'
    } else if (service === 'coletSchimb' && this.selectedServices['documentSchimb']) {
      this.selectedServices['documentSchimb'] = false; // Uncheck 'documentSchimb'
    }

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
      return this.extraServices
        .filter(service => service.value !== 'rambursCont' && service.value !== 'transportRamburs');
    }
    return this.extraServices;
  }


  isFormValid(): boolean {
    let packageValid =
      this.isPlicSelected ||
      (this.courierPackages.length > 0 && this.courierPackages.every(pkg => pkg.valid));
    // Ensure expeditorFormComponent is defined before accessing formGroup
    if (!this.expeditorFormComponent || !this.expeditorFormComponent.formGroup) {
      return false;
    }

    const expeditorControls = Object.keys(this.expeditorFormComponent.formGroup.controls).filter(
      (controlName) => this.expeditorFormComponent.formGroup.get(controlName)?.invalid
    );
    const destinatarControls = Object.keys(this.destinatarFormComponent.formGroup.controls).filter(
      (controlName) => this.destinatarFormComponent.formGroup.get(controlName)?.invalid
    );
    let expeditorLength = expeditorControls.length;
    let destinatarL = destinatarControls.length;

    // console.log('Invalid Controls:', destinatarControls);
    // console.log('Invalid Controls:', expeditorControls);
    // console.log("package valid : " + packageValid);
    // console.log("expeditor valid " + this.expeditorFormValid)
    // console.log("destinatar valid " + this.destinatarFormValid)
    // console.log('destinatar length : ' + destinatarControls)
    // console.log('expeditor length : ' + expeditorLength)

    let isvalid = expeditorLength == 0 && destinatarL == 0 && packageValid;
    // console.log('Everything is valid', isvalid)
    return isvalid;
  }


  onSubmit(): void {
    // if (this.isFormValid()) {
    const expeditorData = this.expeditorFormComponent.orderForm.getRawValue();
    const destinatarData = this.destinatarFormComponent.orderForm.getRawValue();
    const packagesData = this.courierPackages.map(pkg => pkg.form.getRawValue());

    const orderData: OrderData = {
      email: expeditorData.email ? expeditorData.email : this.email,
      pickupDate: undefined,
      price: undefined,
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
      iban: this.iban,
      detinatorIban: this.detinatorIban
    };

    if (this.isLoggedIn) {
      setTimeout(() => this.updateIbanInfo(), 0);

      this.priceCalculationService.getPrices(orderData).subscribe(
        (response) => {
          const basePath = this.isAdmin ? '/admin' : '/dashboard';
          this.router.navigate([`${basePath}/courier-options`],
            {
              queryParams: {
                couriers: JSON.stringify(response),
                orderData: JSON.stringify(orderData)
              }
            });
        });
    } else {
      this.priceCalculationService.getPricesFree(orderData).subscribe(
        (response) => {
          this.router.navigate(['/courier-options'],
            {
              queryParams: {
                couriers: JSON.stringify(response),
                orderData: JSON.stringify(orderData)
              }
            });
        })
      // }
    }
  }

  private updateIbanInfo() {
    if (this.iban && this.detinatorIban) {
      this.clientService.getClientByEmail(this.email).subscribe(
        (client) => {
          const updatedBillingInfo = {
            ...client.billing_info,  // preserve existing billing info
            iban: this.iban,
            iban_name: this.detinatorIban
          };

          this.clientService.modifyBillingInfo(this.email, updatedBillingInfo).subscribe({
            next: () => console.log('Billing info updated successfully'),
            error: (error) => console.error('Error updating billing info:', error)
          });
        }
      );
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

    const infoText = this.renderer.createText('Va rugam compleati datele profilului pentru a incepe sa trimiteti!');
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
