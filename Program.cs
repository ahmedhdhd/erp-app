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

// -------------------- Services --------------------

// Controllers
builder.Services.AddControllers();

// Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        })
        .LogTo(Console.WriteLine, LogLevel.Information)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors());

// JWT Authentication & Authorization
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddJwtAuthorization();

// Register DAOs
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

// Register Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<FournisseurService>();
builder.Services.AddScoped<CommandeAchatService>();
builder.Services.AddScoped<CommandeVenteService>();
builder.Services.AddScoped<CompanySettingsService>();
builder.Services.AddScoped<ReglementService>();

// Logging
builder.Services.AddLogging();

// CORS (optional since same domain, but safe)
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myAllowSpecificOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // JWT support
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
            new string[] { }
        }
    });

    // Optional: XML comments for Swagger docs
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// -------------------- App --------------------
var app = builder.Build();

// -------------------- Middleware Order --------------------

// ✅ 1. Serve Angular static files first
app.UseDefaultFiles();
app.UseStaticFiles();

// ✅ 2. HTTPS redirect
app.UseHttpsRedirection();

// ✅ 3. Swagger (keep enabled for tests)
app.UseSwagger();
app.UseSwaggerUI();

// ✅ 4. CORS (optional for same-origin, but harmless)
app.UseCors("_myAllowSpecificOrigins");

// ✅ 5. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// ✅ 6. API controllers
app.MapControllers();

// ✅ 7. Fallback to Angular index.html for SPA routes
app.MapFallbackToFile("index.html");

// ✅ 8. Run the app
app.Run();
