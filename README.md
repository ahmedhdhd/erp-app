# ERP

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
