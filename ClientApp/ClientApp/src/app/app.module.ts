import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Authentication Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChangePasswordComponent } from './components/auth/change-password/change-password.component';
import { ProfileComponent } from './components/auth/profile/profile.component';

// Dashboard Components
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

// Shared Components
import { HeaderComponent } from './components/shared/header/header.component';

// Services and Guards
import { AuthService } from './services/auth.service';
import { EmployeeService } from './services/employee.service';
import { ProductService } from './services/product.service';
import { ClientService } from './services/client.service';
import { ConfigService } from './services/config.service';
import { AuthGuard, AdminGuard, GuestGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    ProfileComponent,
    DashboardComponent,
    // Employee Components
    EmployeeListComponent,
    EmployeeFormComponent,
    EmployeeDetailComponent,
    EmployeeStatsComponent,
    // Product Components
    ProductListComponent,
    ProductFormComponent,
    ProductDetailComponent,
    ProductStatisticsComponent,
    CategoryManagementComponent,
    StockManagementComponent,
    // Client Components
    ClientListComponent,
    ClientFormComponent,
    ClientDetailComponent,
    ClientStatisticsComponent,
    // Supplier Components
    SupplierListComponent,
    SupplierFormComponent,
    SupplierDetailComponent,
    SupplierStatisticsComponent,
    // Shared Components
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    AuthService,
    EmployeeService,
    ProductService,
    ClientService,
    ConfigService,
    AuthGuard,
    AdminGuard,
    GuestGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }