import {
  Routes,
} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {authGuardFn} from '@auth0/auth0-angular';
import {MainLayoutComponent} from "./components/public/main-layout/main-layout.component";
import {AdminLayoutComponent} from "./components/admin/admin-layout/admin-layout.component";
import {AdminPricesComponent} from "./pages/admin-prices/admin-prices.component";
import {DashboardLayoutComponent} from "./components/dashboard/dashboard-layout/dashboard-layout.component";
import {CreateOrderComponent} from "./components/dashboard/create-order/create-order.component";
import {CourierOptionsComponent} from "./components/dashboard/courier-options/courier-options.component";
import {OrderListComponent} from "./components/dashboard/order-list/order-list.component";
import {OrderFormComponent} from "./components/dashboard/create-order/order-form/order-form.component";

export const routes: Routes = [

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuardFn],
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
        component: OrderListComponent,
      },
      {
        path: 'favorite-addresses',
        component: OrderListComponent,
      },
      {
        path: 'ticketing',
        component: OrderListComponent,
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
        canActivate: [authGuardFn],
      }]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {path: '', component: HomeComponent}
    ]
  },
];
