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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), 
           sqlServerOptionsAction: sqlOptions =>
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

// Register Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<FournisseurService>();
builder.Services.AddScoped<CommandeAchatService>();
builder.Services.AddScoped<CommandeVenteService>();
builder.Services.AddScoped<CompanySettingsService>();
builder.Services.AddScoped<FinancialService>();

// Logging
builder.Services.AddLogging();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myAllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
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
            new string[] {}
        }
    });

    // Ensure all APIs are documented
    c.TagActionsBy(api => new[] { api.GroupName ?? api.RelativePath.Split('/')[0] });
    c.OrderActionsBy((apiDesc) => $"{apiDesc.ActionDescriptor.RouteValues["controller"]}_{apiDesc.HttpMethod}");
    
    // Optional: XML comments for Swagger docs
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// -------------------- App --------------------
var app = builder.Build();

// Swagger - Always enable for testing purposes
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

// HTTPS
app.UseHttpsRedirection();

// CORS
app.UseCors("_myAllowSpecificOrigins");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Static files & SPA fallback
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

// -------------------- Dev-only seeding --------------------
// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var db = services.GetRequiredService<ApplicationDbContext>();
//         if (!db.Utilisateurs.Any())
//         {
//             var defaultEmployee = db.Employes.FirstOrDefault() ?? new Employe
//             {
//                 Nom = "Admin",
//                 Prenom = "Default",
//                 CIN = Guid.NewGuid().ToString("N").Substring(0, 8),
//                 Poste = "Admin",
//                 Departement = "IT",
//                 Email = "admin@example.com",
//                 Telephone = "000000000",
//                 SalaireBase = 0,
//                 Prime = 0,
//                 DateEmbauche = DateTime.UtcNow,
//                 Statut = "Actif"
//             };

//             if (defaultEmployee.Id == 0)
//             {
//                 db.Employes.Add(defaultEmployee);
//                 db.SaveChanges();
//             }

//             // password: Admin@123
//             using var sha = System.Security.Cryptography.SHA256.Create();
//             var hash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes("Admin@123")));

//             db.Utilisateurs.Add(new Utilisateur
//             {
//                 NomUtilisateur = "admin",
//                 MotDePasse = hash,
//                 Role = "Admin",
//                 EmployeId = defaultEmployee.Id,
//                 EstActif = true
//             });
//             db.SaveChanges();
//         }
//     }
//     catch (Exception ex)
//     {
//         var logger = services.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "Erreur durant le seeding de l'admin par défaut");
//     }
// }

app.Run();