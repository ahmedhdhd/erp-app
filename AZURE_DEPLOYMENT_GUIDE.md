# Azure Deployment Guide for ERP Application

This guide will help you deploy your .NET 6 + Angular ERP application to Azure using your student account.

## Prerequisites

1. Azure student account
2. Azure subscription (comes with your student account)
3. Azure CLI installed
4. Visual Studio or Visual Studio Code
5. SQL Server Management Studio (optional)

## Step 1: Prepare Your Azure Resources

### Create Azure SQL Database
1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "SQL Database"
4. Fill in the required information:
   - Database name: `appdb`
   - Resource group: Create new or use existing
   - Server: Create new server with your credentials
   - Want to use SQL elastic pool: No
   - Compute + storage: Basic tier (recommended for development)
5. Review and create the database

### Get Connection String
1. After deployment, go to your SQL Database resource
2. Click "Connection strings" in the left menu
3. Copy the ADO.NET connection string
4. Update your `appsettings.Azure.json` with this connection string

## Step 2: Update Application Settings

You've already updated your `appsettings.Azure.json` with the Azure SQL Database connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:serverapperp.database.windows.net,1433;Initial Catalog=appdb;Persist Security Info=False;User ID=ahmed;Password={hamed123@@};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

## Step 3: Prepare Your Application Code

### Update CORS Settings in Program.cs

We've already updated your Program.cs to support both local development and Azure deployment:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myAllowSpecificOrigins", policy =>
    {
        // Allow both localhost for development and Azure for production
        var allowedOrigins = new[] { 
            "http://localhost:4200",
            "https://localhost:4200",
            builder.Configuration["FrontendUrl"] ?? "https://YOUR_FRONTEND_APP.azurewebsites.net"
        };
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

## Step 4: Deploy Backend (.NET 6 API) to Azure App Service

### Option 1: Using Visual Studio
1. Right-click your project in Solution Explorer
2. Select "Publish"
3. Choose "Azure" as the target
4. Select "Azure App Service (Windows)"
5. Sign in with your Azure account
6. Create a new App Service:
   - Name: `erp-backend-app`
   - Subscription: Your student subscription
   - Resource group: Same as your database
   - Hosting Plan: Basic (B1 recommended for development)
7. Click "Create" and then "Publish"

### Option 2: Using Azure CLI with Deployment Scripts
We've created deployment scripts to automate this process:

1. For Windows PowerShell: Run `azure-deploy.ps1`
2. For Linux/Mac: Run `azure-deploy.sh`

Update the variables in the script with your actual values:
- Subscription ID
- Resource group name
- App service name
- SQL server name
- Database name

### Option 3: Manual Azure CLI Commands
1. Install Azure CLI if not already installed
2. Open terminal in your project root directory
3. Run the following commands:

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create resource group (if not already created)
az group create --name erp-resource-group --location "East US"

# Create App Service plan
az appservice plan create --name erp-app-service-plan --resource-group erp-resource-group --sku B1 --is-linux

# Create web app
az webapp create --resource-group erp-resource-group --plan erp-app-service-plan --name erp-backend-app --runtime "DOTNETCORE|6.0"

# Configure application settings
az webapp config appsettings set --resource-group erp-resource-group --name erp-backend-app \
    --settings Jwt__Key="ThisismySecretKey" Jwt__Issuer="Test.com" \
    FrontendUrl="https://YOUR_FRONTEND_APP.azurewebsites.net"

# Set connection string
az webapp config connection-string set --resource-group erp-resource-group --name erp-backend-app \
    --connection-string-type SQLServer \
    --settings DefaultConnection="Server=tcp:serverapperp.database.windows.net,1433;Initial Catalog=appdb;Persist Security Info=False;User ID=ahmed;Password={hamed123@@};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Build and publish your application
dotnet publish -c Release -o ./publish

# Deploy your application
az webapp deployment source config-zip --resource-group erp-resource-group --name erp-backend-app --src ./publish/App.zip
```

## Step 5: Deploy Frontend (Angular) to Azure Static Web Apps

### Build Angular Application
1. Navigate to ClientApp/ClientApp directory
2. Run: `npm run build`
3. This creates a `dist` folder with your compiled Angular app

### Deploy to Azure Static Web Apps
1. In Azure Portal, click "Create a resource"
2. Search for "Static Web App"
3. Fill in the required information:
   - Name: `erp-frontend-app`
   - Resource group: Same as before
   - Plan type: Free
   - Region: Same as your other resources
4. For deployment details:
   - Source: Other (since we'll deploy manually)
5. Click "Review + create" then "Create"

### Upload Angular Build
1. After deployment, go to your Static Web App resource
2. Click "Overview" and note your URL
3. Use Azure CLI to deploy:

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy your Angular app
swa deploy dist/client-app --app-name erp-frontend-app --resource-group erp-resource-group
```

## Step 6: Configure Application Settings

### Update Backend Settings
1. Go to your App Service in Azure Portal
2. Click "Configuration" in the left menu
3. Add application settings for your JWT configuration:
   - Name: `Jwt:Key`, Value: `ThisismySecretKey`
   - Name: `Jwt:Issuer`, Value: `Test.com`
   - Name: `FrontendUrl`, Value: `https://YOUR_FRONTEND_APP.azurewebsites.net`
4. Update the connection string:
   - Name: `DefaultConnection`
   - Value: Your Azure SQL Database connection string

### Update Frontend API URL
1. In your Angular app, update the API base URL to point to your backend App Service URL
2. This is typically in an environment file or service configuration

## Step 7: Run Database Migrations

### Using Azure Cloud Shell
1. In Azure Portal, open Azure Cloud Shell
2. Clone your repository or upload your project files
3. Navigate to your project directory
4. Run Entity Framework migrations:

```bash
# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Run migrations
dotnet ef database update --connection "Server=tcp:serverapperp.database.windows.net,1433;Initial Catalog=appdb;Persist Security Info=False;User ID=ahmed;Password={hamed123@@};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

### Alternative: Using Local Development Environment
1. Update your connection string in `appsettings.json` to point to your Azure SQL Database
2. Run the following command in your project root:

```bash
dotnet ef database update
```

## Step 8: Test Your Deployment

1. Access your frontend URL (from Static Web App)
2. Test the login functionality
3. Verify that API calls are working correctly
4. Check that database operations are functioning

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your CORS policy includes your frontend URL
2. **Database Connection**: Verify your connection string and firewall rules
3. **Missing Migrations**: Ensure all database migrations have been applied
4. **Authentication Issues**: Check JWT configuration in Azure App Settings

### Useful Azure CLI Commands
```bash
# View logs
az webapp log tail --resource-group erp-resource-group --name erp-backend-app

# Restart app
az webapp restart --resource-group erp-resource-group --name erp-backend-app

# View app settings
az webapp config appsettings list --resource-group erp-resource-group --name erp-backend-app
```

## Azure Student Account Benefits

As a student, you have access to:
- $100 credit for Azure services
- Free access to popular Azure services for 12 months
- Free access to software development tools

Make sure to monitor your usage to stay within the free tier limits.

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificate (automatically provided by Azure)
3. Set up monitoring and alerts
4. Configure backup for your database