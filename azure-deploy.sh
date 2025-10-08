#!/bin/bash

# Azure Deployment Script for ERP Application
# This script helps deploy your .NET 6 application to Azure App Service

echo "Starting Azure deployment process..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null
then
    echo "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure (if not already logged in)
echo "Please login to your Azure account..."
az login

# Set your subscription (replace with your actual subscription ID)
echo "Setting subscription..."
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Variables - Update these with your actual values
RESOURCE_GROUP="erp-resource-group"
LOCATION="EastUS"
APP_SERVICE_PLAN="erp-app-service-plan"
APP_NAME="erp-backend-app"
SQL_SERVER_NAME="serverapperp"
SQL_DB_NAME="appdb"

echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "Creating App Service plan..."
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

echo "Creating web app..."
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $APP_NAME --runtime "DOTNETCORE|6.0"

echo "Configuring application settings..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME \
    --settings Jwt__Key="ThisismySecretKey" Jwt__Issuer="Test.com"

echo "Setting connection string..."
az webapp config connection-string set --resource-group $RESOURCE_GROUP --name $APP_NAME \
    --connection-string-type SQLServer \
    --settings DefaultConnection="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DB_NAME;Persist Security Info=False;User ID=ahmed;Password={hamed123@@};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

echo "Building and publishing the application..."
dotnet publish -c Release -o ./publish

echo "Deploying application to Azure..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src ./publish/App.zip

echo "Deployment completed successfully!"
echo "Your application is now available at: https://$APP_NAME.azurewebsites.net"

# Instructions for running migrations
echo ""
echo "IMPORTANT: You still need to run database migrations."
echo "You can do this by:"
echo "1. Using Azure Cloud Shell"
echo "2. Or connecting directly to your Azure SQL Database and running the EF migrations"