# Azure Deployment Script for ERP Application (PowerShell version)
# This script helps deploy your .NET 6 application to Azure App Service

Write-Host "Starting Azure deployment process..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az --version
    Write-Host "Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Login to Azure (if not already logged in)
Write-Host "Please login to your Azure account..." -ForegroundColor Yellow
az login

# Set your subscription (replace with your actual subscription ID)
Write-Host "Setting subscription..." -ForegroundColor Yellow
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Variables - Update these with your actual values
$RESOURCE_GROUP = "erp-resource-group"
$LOCATION = "EastUS"
$APP_SERVICE_PLAN = "erp-app-service-plan"
$APP_NAME = "erp-backend-app"
$SQL_SERVER_NAME = "serverapperp"
$SQL_DB_NAME = "appdb"

Write-Host "Creating resource group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host "Creating App Service plan..." -ForegroundColor Yellow
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

Write-Host "Creating web app..." -ForegroundColor Yellow
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $APP_NAME --runtime "DOTNETCORE|6.0"

Write-Host "Configuring application settings..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME `
    --settings Jwt__Key="ThisismySecretKey" Jwt__Issuer="Test.com"

Write-Host "Setting connection string..." -ForegroundColor Yellow
az webapp config connection-string set --resource-group $RESOURCE_GROUP --name $APP_NAME `
    --connection-string-type SQLServer `
    --settings DefaultConnection="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DB_NAME;Persist Security Info=False;User ID=ahmed;Password={hamed123@@};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

Write-Host "Building and publishing the application..." -ForegroundColor Yellow
dotnet publish -c Release -o ./publish

Write-Host "Deploying application to Azure..." -ForegroundColor Yellow
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src ./publish/App.zip

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your application is now available at: https://$APP_NAME.azurewebsites.net" -ForegroundColor Cyan

# Instructions for running migrations
Write-Host ""
Write-Host "IMPORTANT: You still need to run database migrations." -ForegroundColor Yellow
Write-Host "You can do this by:" -ForegroundColor Yellow
Write-Host "1. Using Azure Cloud Shell" -ForegroundColor Yellow
Write-Host "2. Or connecting directly to your Azure SQL Database and running the EF migrations" -ForegroundColor Yellow