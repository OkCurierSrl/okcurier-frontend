import {
  Routes,
} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {authGuardFn} from '@auth0/auth0-angular';
import {MainLayoutComponent} from "./components/public/main-layout/main-layout.component";
import {AdminLayoutComponent} from "./components/admin/admin-layout/admin-layout.component";
import {AdminPricesComponent} from "./pages/admin-prices/admin-prices.component";
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

export const routes: Routes = [

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    // canActivate: [authGuardFn],
    children: [
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
      }
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'prices',
        component: AdminPricesComponent,
        // canActivate: [authGuardFn],
      }]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {path: 'test', component: HeroComponent},
      {path: '', component: LandingPageComponent},
      {path: 'oferta', component: RequestOfferComponent},
      {path: 'order', component: CreateOrderComponent},
      {path: 'info', component: HowToOrderComponent}
    ]
  },
];
