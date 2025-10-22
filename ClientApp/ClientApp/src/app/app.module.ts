import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
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

// Purchase Management Components
import { PurchaseOrderListComponent } from './components/purchase-management/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './components/purchase-management/purchase-order-form/purchase-order-form.component';
import { PurchaseOrderDetailComponent } from './components/purchase-management/purchase-order-detail/purchase-order-detail.component';
import { GoodsReceiptComponent } from './components/purchase-management/goods-receipt/goods-receipt.component';
import { GoodsReceiptListComponent } from './components/purchase-management/goods-receipt-list/goods-receipt-list.component';
import { TestApiComponent } from './components/purchase-management/test-api/test-api.component';

// Sales Management Components
import { SalesComponent } from './components/sales/sales.component';
import { QuoteListComponent } from './components/sales/quote-list/quote-list.component';
import { QuoteFormComponent } from './components/sales/quote-form/quote-form.component';
import { QuoteDetailComponent } from './components/sales/quote-detail/quote-detail.component';
import { OrderListComponent } from './components/sales/order-list/order-list.component';
import { OrderFormComponent } from './components/sales/order-form/order-form.component';
import { OrderDetailComponent } from './components/sales/order-detail/order-detail.component';

// Company Settings Components
import { CompanySettingsComponent } from './components/company-settings/company-settings.component';
import { StockMovementComponent } from './components/stock-management/stock-movement/stock-movement.component';


// Shared Components
import { HeaderComponent } from './components/shared/header/header.component';
import { JournalListComponent } from './components/financial/journal-list/journal-list.component';
import { FinancialDashboardComponent } from './components/financial/dashboard/financial-dashboard.component';
import { AccountingListComponent } from './components/financial/accounting/accounting-list.component';

// Services and Guards
import { AuthService } from './services/auth.service';
import { EmployeeService } from './services/employee.service';
import { ProductService } from './services/product.service';
import { ClientService } from './services/client.service';
import { ConfigService } from './services/config.service';
import { PurchaseService } from './services/purchase.service';
import { SalesService } from './services/sales.service';
import { InvoiceService } from './services/invoice.service';
import { FinancialService } from './services/financial.service';
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
    StockMovementComponent,
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
    // Purchase Management Components
    PurchaseOrderListComponent,
    PurchaseOrderFormComponent,
    PurchaseOrderDetailComponent,
    GoodsReceiptComponent,
    GoodsReceiptListComponent,
    TestApiComponent,
    // Sales Management Components
    SalesComponent,
    QuoteListComponent,
    QuoteFormComponent,
    QuoteDetailComponent,
    OrderListComponent,
    OrderFormComponent,
    OrderDetailComponent,
    // Shared Components
    HeaderComponent,
    // Company Settings Components
    CompanySettingsComponent,
    JournalListComponent,
    FinancialDashboardComponent,
    AccountingListComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
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
    PurchaseService,
    SalesService,
    InvoiceService,
    FinancialService,
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