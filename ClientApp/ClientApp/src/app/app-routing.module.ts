import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard, AdminGuard, GuestGuard } from './guards/auth.guard';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChangePasswordComponent } from './components/auth/change-password/change-password.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Employee Components
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employees/employee-form/employee-form.component';
import { EmployeeDetailComponent } from './components/employees/employee-detail/employee-detail.component';
import { EmployeeStatsComponent } from './components/employees/employee-stats/employee-stats.component';

// Product Components
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { ProductFormComponent } from './components/product/product-form/product-form.component';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component';
import { ProductStatisticsComponent } from './components/product/product-statistics/product-statistics.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { StockManagementComponent } from './components/stock-management/stock-management.component';

// Client Components
import { ClientListComponent } from './components/client/client-list/client-list.component';
import { ClientFormComponent } from './components/client/client-form/client-form.component';
import { ClientDetailComponent } from './components/client/client-detail/client-detail.component';
import { ClientStatisticsComponent } from './components/client/client-statistics/client-statistics.component';

// Supplier Components
import { SupplierListComponent } from './components/supplier/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './components/supplier/supplier-form/supplier-form.component';
import { SupplierDetailComponent } from './components/supplier/supplier-detail/supplier-detail.component';
import { SupplierStatisticsComponent } from './components/supplier/supplier-statistics/supplier-statistics.component';

const routes: Routes = [
  // Default route - redirect based on authentication
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Authentication routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [GuestGuard] // Only allow access if not authenticated
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [AdminGuard] // Only admins can register new users
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard] // Must be authenticated
      }
    ]
  },

  // Protected routes
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  // Dashboard route
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // Employee Management routes
  {
    path: 'employees',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: EmployeeListComponent
      },
      {
        path: 'create',
        component: EmployeeFormComponent,
        data: { requiredRoles: ['Admin', 'HR'] }
      },
      {
        path: 'edit/:id',
        component: EmployeeFormComponent,
        data: { requiredRoles: ['Admin', 'HR'] }
      },
      {
        path: 'detail/:id',
        component: EmployeeDetailComponent
      },
      {
        path: 'view/:id',
        redirectTo: 'detail/:id' // Alias for detail
      },
      {
        path: 'statistics',
        component: EmployeeStatsComponent,
        data: { requiredRoles: ['Admin', 'HR', 'Manager'] }
      },
      {
        path: 'stats',
        redirectTo: 'statistics' // Alias for statistics
      }
    ]
  },

  // Product Management routes
  {
    path: 'products',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ProductListComponent
      },
      {
        path: 'new',
        component: ProductFormComponent,
        data: { requiredRoles: ['Admin', 'RH', 'Inventaire'] }
      },
      {
        path: 'create',
        redirectTo: 'new' // Alias for new
      },
      {
        path: 'statistics',
        component: ProductStatisticsComponent,
        data: { requiredRoles: ['Admin', 'RH', 'Inventaire'] }
      },
      {
        path: 'stats',
        redirectTo: 'statistics' // Alias for statistics
      },
      {
        path: ':id',
        component: ProductDetailComponent
      },
      {
        path: ':id/view',
        redirectTo: ':id' // Alias for detail
      },
      {
        path: ':id/edit',
        component: ProductFormComponent,
        data: { requiredRoles: ['Admin', 'RH', 'Inventaire'] }
      }
    ]
  },

  // Client Management routes
  {
    path: 'clients',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ClientListComponent
      },
      {
        path: 'new',
        component: ClientFormComponent,
        data: { requiredRoles: ['Admin', 'Vendeur'] }
      },
      {
        path: 'create',
        redirectTo: 'new' // Alias for new
      },
      {
        path: 'statistics',
        component: ClientStatisticsComponent,
        data: { requiredRoles: ['Admin', 'Vendeur'] }
      },
      {
        path: 'stats',
        redirectTo: 'statistics' // Alias for statistics
      },
      {
        path: ':id',
        component: ClientDetailComponent
      },
      {
        path: ':id/view',
        redirectTo: ':id' // Alias for detail
      },
      {
        path: ':id/edit',
        component: ClientFormComponent,
        data: { requiredRoles: ['Admin', 'Vendeur'] }
      }
    ]
  },

  // Supplier Management routes
  {
    path: 'suppliers',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SupplierListComponent },
      { path: 'new', component: SupplierFormComponent, data: { requiredRoles: ['Admin', 'Acheteur'] } },
      { path: 'create', redirectTo: 'new' },
      { path: 'statistics', component: SupplierStatisticsComponent, data: { requiredRoles: ['Admin', 'Acheteur'] } },
      { path: 'stats', redirectTo: 'statistics' },
      { path: ':id', component: SupplierDetailComponent },
      { path: ':id/view', redirectTo: ':id' },
      { path: ':id/edit', component: SupplierFormComponent, data: { requiredRoles: ['Admin', 'Acheteur'] } }
    ]
  },

  // Category Management routes
  {
    path: 'categories',
    canActivate: [AuthGuard],
    component: CategoryManagementComponent,
    data: { requiredRoles: ['Admin', 'RH', 'Inventaire'] }
  },

  // Stock Management routes
  {
    path: 'stock',
    canActivate: [AuthGuard],
    component: StockManagementComponent,
    data: { requiredRoles: ['Admin', 'RH', 'Inventaire'] }
  },

  // Inventory Management (alias for stock)
  {
    path: 'inventory',
    redirectTo: '/stock'
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'users',
        component: RegisterComponent // Reuse register component for user management
      }
    ]
  },

  // Catch all route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }