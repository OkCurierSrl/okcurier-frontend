import {Routes,} from '@angular/router';
import {ProfileComponent} from './pages/profile/profile.component';
import {authGuardFn} from '@auth0/auth0-angular';
import {MainLayoutComponent} from "./components/public/main-layout/main-layout.component";
import {AdminLayoutComponent} from "./components/admin/admin-layout/admin-layout.component";
import {AdminPricesComponent} from "./components/admin/admin-prices/admin-prices.component";
import {CreateOrderComponent} from "./components/dashboard/create-order/create-order.component";
import {OrderListComponent} from "./components/dashboard/order-list/order-list.component";
import {DashboardLayoutComponent} from "./components/dashboard/dashboard-layout/dashboard-layout.component";
import {RequestMaterialsComponent} from "./components/public/request-materials/request-materials.component";
import {RequestOfferComponent} from "./components/dashboard/request-offer/request-offer.component";
import {HowToOrderComponent} from "./components/public/how-to-order/how-to-order.component";
import {TicketComponent} from "./components/dashboard/ticket/ticket.component";
import {SavedAddressesComponent} from "./components/dashboard/saved-addresses/saved-addresses.component";
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {PaymentConfirmationComponent} from "./components/public/payment-confirmation/payment-confirmation.component";
import {RoleGuard} from "./components/role-guard/role-guard.component";
import {ClientsComponent} from "./components/admin/clients-component/clients.component";
import {ClientViewComponent} from "./components/admin/client-view/client-view.component";
import {ShowComponent} from "./components/dashboard/show/show.component";
import {TrackComponent} from "./components/dashboard/track/track.component";
import {FileUploadComponent} from "./components/admin/file-upload/file-upload.component";
import {OrderListRecheckedComponent} from "./components/dashboard/order-list-rechecked/order-list-rechecked.component";
import {PaymentPortalComponent} from "./components/public/payment-portal/payment-portal.component";
import {CourierOptionsNewComponent} from "./components/public/courier-options-new/courier-options-new.component";
import {DownloadProxyComponent} from "./components/download/download-proxy.component";
import { TrackRedirectGuard } from './guards/track-redirect.guard';
import {GdprComponent} from "./components/public/gdpr/gdpr.component";

export const routes: Routes = [
  // Standalone routes that don't need layouts
  {
    path: 'download/:awb',
    component: DownloadProxyComponent
  },
  {
    path: 'track/:awb',
    component: ShowComponent,
    canActivate: [TrackRedirectGuard]
  },

  // Dashboard routes
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuardFn],
    children: [
      {
        path: '',
        redirectTo: 'order',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'order',
        component: CreateOrderComponent,
      },
      {
        path: 'courier-options',
        component: CourierOptionsNewComponent,
      },
      {
        path: 'order-list',
        component: OrderListComponent,
      },
      {
        path: 'order-list-recheck',
        component: OrderListRecheckedComponent,
      },
      {
        path: 'requests',
        component: RequestMaterialsComponent,
      },
      {
        path: 'favorite-addresses',
        component: SavedAddressesComponent,
      },
      {
        path: 'track/:awb',
        component: ShowComponent,
      },
      {
        path: 'track',
        component: TrackComponent,
      },
      {
        path: 'ticketing',
        component: TicketComponent,
      },
      {
        path: 'payment',
        component: PaymentPortalComponent,
      },
      {path: 'confirm-payment', component: PaymentConfirmationComponent},
      {path: 'gdpr', component: GdprComponent},
    ]
  },

  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuardFn, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'order',
        pathMatch: 'full'
      },
      {
        path: 'prices',
        component: AdminPricesComponent,
        canActivate: [authGuardFn],
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'order',
        component: CreateOrderComponent,
      },
      {
        path: 'order-list-recheck',
        component: OrderListRecheckedComponent,
      },
      {
        path: 'courier-options',
        component: CourierOptionsNewComponent,
      },
      {
        path: 'order-list',
        component: OrderListComponent,
      },
      {
        path: 'requests',
        component: RequestMaterialsComponent,
      },
      {
        path: 'favorite-addresses',
        component: SavedAddressesComponent,
      },
      {
        path: 'ticketing',
        component: TicketComponent,
      },
      {
        path: 'clients',
        component: ClientsComponent
      },
      {
        path: 'track/:awb',
        component: ShowComponent,
      },
      {
        path: 'track',
        component: TrackComponent,
      },
      {
        path: 'client-view',
        component: ClientViewComponent
      },
      {
        path: 'ramburs',
        component: FileUploadComponent
      },
      {
        path: 'payment',
        component: PaymentPortalComponent,
      },
      {path: 'confirm-payment', component: PaymentConfirmationComponent},
      {path: 'gdpr', component: GdprComponent}
    ]
  },
  // Public routes
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {path: '', component: LandingPageComponent},
      {path: 'confirm-payment', component: PaymentConfirmationComponent},
      {path: 'payment', component: PaymentPortalComponent},
      {path: '', redirectTo: '/payment', pathMatch: 'full'},
      {path: 'oferta', component: RequestOfferComponent},
      {path: 'order', component: CreateOrderComponent},
      {path: 'courier-options', component: CourierOptionsNewComponent},
      {path: 'faq', component: HowToOrderComponent},
      {path: 'gdpr', component: GdprComponent},
      {path: 'track/:awb', component: ShowComponent},
      {path: 'track', component: TrackComponent},
    ]
  },
];
