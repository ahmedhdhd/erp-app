# Deployment script for ERP application to Azure
# This script prepares your application for deployment

Write-Host "Starting ERP application deployment preparation..." -ForegroundColor Green

# 1. Restore .NET dependencies
Write-Host "Restoring .NET dependencies..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to restore .NET dependencies" -ForegroundColor Red
    exit 1
}

# 2. Build .NET application
Write-Host "Building .NET application..." -ForegroundColor Yellow
dotnet build -c Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build .NET application" -ForegroundColor Red
    exit 1
}

# 3. Publish .NET application
Write-Host "Publishing .NET application..." -ForegroundColor Yellow
dotnet publish -c Release -o ./publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to publish .NET application" -ForegroundColor Red
    exit 1
}

# 4. Navigate to Angular app directory
Write-Host "Navigating to Angular application directory..." -ForegroundColor Yellow
Set-Location -Path "./ClientApp/ClientApp"

# 5. Install Angular dependencies
Write-Host "Installing Angular dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Angular dependencies" -ForegroundColor Red
    exit 1
}

# 6. Build Angular application
Write-Host "Building Angular application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Angular application" -ForegroundColor Red
    exit 1
}

# 7. Return to root directory
Set-Location -Path "../.."

Write-Host "Deployment preparation completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy the .NET backend from the 'publish' folder to Azure App Service" -ForegroundColor Cyan
Write-Host "2. Deploy the Angular frontend from 'ClientApp/ClientApp/dist' to Azure Static Web Apps" -ForegroundColor Cyan
Write-Host "3. Follow the detailed instructions in AZURE_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan