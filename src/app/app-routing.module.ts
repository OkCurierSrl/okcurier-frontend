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

export const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuardFn],
  },
  {
    path: 'order',
    component: CreateOrderComponent,
    canActivate: [authGuardFn],
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
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'profil',
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
