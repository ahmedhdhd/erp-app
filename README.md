# ERP Tunisie

## Description
ERP Tunisie is a comprehensive Enterprise Resource Planning application designed for Tunisian businesses. The system provides end-to-end business management capabilities with a focus on employee data management, product inventory, customer relationship management, and sales operations. 

The application uses a Web API built with ASP.NET Core to store and retrieve data from a SQL Server database, with an Angular frontend interface for user interaction.

### Current Development Status
The application is currently 50% complete with 5 core modules fully implemented:
- Authentication & User Management
- Employee Management (HR)
- Product & Inventory Management
- Customer Relationship Management (CRM)
- Sales Management

6 additional modules are planned for future development including Supplier Relationship Management, Purchase Management, Financial Management, Reporting & Analytics, System Administration, and Base Infrastructure enhancements.

## 🟢 Implemented Features

### 1. Authentication & User Management ✅
- User login with JWT token authentication
- User registration (Admin only)
- Password change and reset functionality
- User profile management
- Role-based access control (Admin, RH, Vendeur, Acheteur, StockManager)
- Session management

### 2. Employee Management (HR) ✅
- Complete employee CRUD operations
- Advanced employee search and filtering
- Employee statistics and analytics with charts
- Department and position management
- Employee status tracking
- CSV export functionality
- Bulk operations support

### 3. Product & Inventory Management ✅
- Product catalog management
- Category and sub-category organization
- Product variant support
- Stock level tracking and alerts
- Price management (purchase/sale/minimum)
- Inventory movement history
- Unit of measure management

### 4. Customer Relationship Management (CRM) ✅
- Client database management
- Contact management
- Client search and filtering
- Client classification and segmentation
- Credit limit management
- Client statistics dashboard
- CSV export functionality

### 5. Sales Management ✅
- Quote/Estimate creation and management
- Sales order processing
- Quote-to-order conversion
- Sales reporting (partial)
- Client-based sales tracking

## 🔴 Planned Features

### 6. Supplier Relationship Management (SRM)
- Supplier database management
- Supplier contact management
- Supplier performance tracking
- Delivery time monitoring

### 7. Purchase Management
- Purchase request management
- Purchase order processing
- Goods receipt processing
- Purchase invoice management

### 8. Financial Management
- Accounting entry management
- Journal management
- Financial reporting

### 9. Payroll Management
- Employee payroll processing
- Attendance tracking
- Salary calculation

### 10. Reporting & Analytics
- Sales reporting
- Purchase reporting
- Inventory reporting
- Financial reporting
- Custom report generation

### 11. System Administration
- Audit log management
- System configuration
- Backup/restore functionality
- Security settings management

## Technologies Used
- **Backend**: ASP.NET Core 8.0
- **Frontend**: Angular 16
- **Database**: SQL Server
- **ORM**: Entity Framework Core 8.0
- **Authentication**: JWT Tokens
- **UI Framework**: Bootstrap 5.3
- **Charting**: ApexCharts
- **API Documentation**: Swagger/OpenAPI

## Architecture & Design Patterns
- RESTful API design
- Dependency Injection (DI)
- Model-View-Controller (MVC)
- Code First approach
- JWT Token-based Authentication & Authorization
- Repository Pattern
- Service Layer Pattern
- Role-based Access Control

## Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (version 16.x recommended)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [Angular CLI](https://cli.angular.io/)

## Local Development Setup

1. Clone the repository
2. Update the connection string in `appsettings.json`
3. Run database migrations:
   ```
   dotnet ef database update
   ```
4. Build and run the backend:
   ```
   dotnet run
   ```
5. In a separate terminal, navigate to `ClientApp/ClientApp` and run:
   ```
   npm install
   npm start
   ```

## API Documentation
The application includes Swagger/OpenAPI documentation accessible at `/swagger` when the application is running.

## Deployment
For Azure deployment instructions, please refer to [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md).

You can also use the deployment script [deploy.ps1](deploy.ps1) to prepare your application for deployment.

## Development Progress
Overall System Progress: 50% Complete

| Module | Status |
|--------|--------|
| Authentication & User Management | ✅ 100% Complete |
| Employee Management | ✅ 100% Complete |
| Product & Inventory Management | ✅ 100% Complete |
| Customer Relationship Management | ✅ 100% Complete |
| Sales Management | ✅ 100% Complete |
| Supplier Relationship Management | ❌ Not Started |
| Purchase Management | ❌ Not Started |
| Financial Management | ❌ Not Started |
| Payroll Management | ❌ Not Started |
| Reporting & Analytics | ❌ Not Started |
| System Administration | 🟡 Partially Implemented |