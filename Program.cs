using System.Text;
using App.Models;
using App.Data;
using App.Data.Interfaces;
using App.Data.Implementations;
using App.Services;
using App.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 🧩 1. Add Core Services
// ============================================================

builder.Services.AddControllers();

// ------------------------------------------------------------
// Database (Entity Framework)
// ------------------------------------------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null
            );
            // Disable use of OUTPUT clause to avoid conflicts with database triggers
            sqlOptions.UseCompatibilityLevel(130); // SQL Server 2016 compatibility level
        }
    )
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableSensitiveDataLogging()
    .EnableDetailedErrors()
);

// ------------------------------------------------------------
// JWT Authentication & Authorization
// ------------------------------------------------------------
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddJwtAuthorization();

// ------------------------------------------------------------
// Register Data Access Objects (DAOs)
// ------------------------------------------------------------
builder.Services.AddScoped<IAuthDAO, AuthDAO>();
builder.Services.AddScoped<IEmployeeDAO, EmployeeDAO>();
builder.Services.AddScoped<IClientDAO, ClientDAO>();
builder.Services.AddScoped<IProductDAO, ProductDAO>();
builder.Services.AddScoped<IFournisseurDAO, FournisseurDAO>();
builder.Services.AddScoped<ICommandeAchatDAO, CommandeAchatDAO>();
builder.Services.AddScoped<ICommandeVenteDAO, CommandeVenteDAO>();
builder.Services.AddScoped<ICompanySettingsDAO, CompanySettingsDAO>();
builder.Services.AddScoped<IReglementDAO, ReglementDAO>();
builder.Services.AddScoped<IJournalDAO, JournalDAO>();
builder.Services.AddScoped<IPayrollDAO, PayrollDAO>();
builder.Services.AddScoped<IAttendanceDAO, AttendanceDAO>(); // Add this line

// ------------------------------------------------------------
// Register Business Services
// ------------------------------------------------------------
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<FournisseurService>();
builder.Services.AddScoped<CommandeAchatService>();
builder.Services.AddScoped<CommandeVenteService>();
builder.Services.AddScoped<CompanySettingsService>();
builder.Services.AddScoped<ReglementService>();
builder.Services.AddScoped<PayrollService>();
builder.Services.AddScoped<AttendanceService>(); // Add this line

// ------------------------------------------------------------
// Logging
// ------------------------------------------------------------
builder.Services.AddLogging();

// ------------------------------------------------------------
// CORS Configuration
// ------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myAllowSpecificOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ------------------------------------------------------------
// Swagger / OpenAPI Configuration
// ------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // JWT support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your JWT token."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Group endpoints by controller or route
    c.TagActionsBy(api => new[] { api.GroupName ?? api.RelativePath.Split('/')[0] });
    c.OrderActionsBy(apiDesc => $"{apiDesc.ActionDescriptor.RouteValues["controller"]}_{apiDesc.HttpMethod}");

    // Include XML documentation if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// ============================================================
// 🚀 2. Build Application
// ============================================================

var app = builder.Build();

// ============================================================
// 🌐 3. Configure Middleware Pipeline
// ============================================================

// Swagger (enabled for all environments)
app.UseSwagger();
app.UseSwaggerUI();

// Serve static Angular files (wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

// HTTPS redirection
app.UseHttpsRedirection();

// CORS
app.UseCors("_myAllowSpecificOrigins");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// SPA Fallback (Angular)
app.MapFallbackToFile("index.html");

// Run the application
app.Run();
