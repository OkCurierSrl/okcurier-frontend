import {
  Routes,
} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {authGuardFn} from '@auth0/auth0-angular';
import {MainLayoutComponent} from "./components/public/main-layout/main-layout.component";
import {AdminLayoutComponent} from "./components/admin/admin-layout/admin-layout.component";
import {AdminPricesComponent} from "./components/admin/admin-prices/admin-prices.component";
import {CreateOrderComponent} from "./components/dashboard/create-order/create-order.component";
import {CourierOptionsComponent} from "./components/dashboard/courier-options/courier-options.component";
import {OrderListComponent} from "./components/dashboard/order-list/order-list.component";
import {DashboardLayoutComponent} from "./components/dashboard/dashboard-layout/dashboard-layout.component";
import {RequestMaterialsComponent} from "./components/public/request-materials/request-materials.component";
import {RequestOfferComponent} from "./components/dashboard/request-offer/request-offer.component";
import {HowToOrderComponent} from "./components/public/how-to-order/how-to-order.component";
import {TicketComponent} from "./components/dashboard/ticket/ticket.component";
import {SavedAddressesComponent} from "./components/dashboard/saved-addresses/saved-addresses.component";
import {LandingPageComponent} from "./pages/landing-page/landing-page.component";
import {HeroComponent} from "./components/public/hero/hero.component";
import {NetopiaComponent} from "./components/public/netopia-payment/netopia-payment.component";
import {
  CourierOptionsPublicComponent
} from "./components/public/courier-options-public/courier-options-public.component";
import {RoleGuard} from "./components/role-guard/role-guard.component";
import {ClientsComponent} from "./components/admin/clients-component/clients.component";
import {ClientViewComponent} from "./components/admin/client-view/client-view.component";
import {ShowComponent} from "./components/dashboard/show/show.component";
import {TrackComponent} from "./components/dashboard/track/track.component";
import {FileUploadComponent} from "./components/admin/file-upload/file-upload.component";
import {OrderListRecheckedComponent} from "./components/dashboard/order-list-rechecked/order-list-rechecked.component";

export const routes: Routes = [

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuardFn],
    children: [
      {
        path: '',
        redirectTo: 'order',
        pathMatch: 'full' // Ensures redirect occurs only on exact 'admin' path
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
        component: CourierOptionsComponent,
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
      }
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuardFn, RoleGuard],
    data: {roles: ['ADMIN']}, // Specify the roles required for this route
    children: [
      {
        path: '',
        redirectTo: 'order',
        pathMatch: 'full' // Ensures redirect occurs only on exact 'admin' path
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
        component: CourierOptionsComponent,
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
      { path: 'client-view',
        component: ClientViewComponent
      },
      { path: 'ramburs',
        component: FileUploadComponent
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {path: '', component: LandingPageComponent},
      {path: 'netopia', component: NetopiaComponent},
      {path: 'oferta', component: RequestOfferComponent},
      {path: 'order', component: CreateOrderComponent},
      {path: '', component: CreateOrderComponent},
      {path: 'courier-options', component: CourierOptionsPublicComponent},
      {path: 'info', component: HowToOrderComponent},
      {path: 'track/:awb', component: ShowComponent,},
      {path: 'track', component: TrackComponent,},
    ]
  },
];
