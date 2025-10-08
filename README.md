# App 
## Description
It's an ERP application for employee's data in which we need data to be saved through a Web API into SQL database (SQL Server 19) and retrieved through an interface (.NET Core 6) using this API. This software system helps you run your entire business, supporting automation and processes in finance, human resources, manufacturing, supply chain, services, procurement, and more.

#### Features
<ul>
  <li>Admin platform</li>
  <li>User Authorization</li>
  <li>Data Analysis</li>
  <li>Data Visualization</li>
  <li>Customer Database</li>
  <li>Account Database</li>
</ul>

#### Technologies Used
<ul>
  <li>ASP.NET Core 6</li>
  <li>SQL Server 2019</li>
  <li>Angular</li>
  <li>Entity Framework Core 6</li>
</ul>

#### Patterns & Concepts used in this App
<ul>
  <li>DI (Dependency Injection)</li>
  <li>MVC (Model-Controller-View)</li>
  <li>Code First</li>
  <li>JWT Tokens (Authentication & Authorization)</li>
</ul>

## Deployment

### Prerequisites
- Azure student account
- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- [Node.js](https://nodejs.org/) (version 16.x recommended)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### Local Development Setup
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

### Azure Deployment
For detailed instructions on deploying to Azure using your student account, please refer to [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md).

You can also use the deployment script [deploy.ps1](deploy.ps1) to prepare your application for deployment.