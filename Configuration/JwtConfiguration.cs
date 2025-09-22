using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace App.Configuration
{
    public static class JwtConfiguration
    {
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtKey = configuration["Jwt:Key"];
            var jwtIssuer = configuration["Jwt:Issuer"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer))
            {
                throw new InvalidOperationException("Configuration JWT manquante. Vérifiez appsettings.json");
            }

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtIssuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ClockSkew = TimeSpan.Zero // Désactiver la tolérance de temps
                };

                // Gérer les erreurs d'authentification
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Token d'authentification manquant ou invalide" });
                        return context.Response.WriteAsync(result);
                    }
                };
            });

            return services;
        }

        public static IServiceCollection AddJwtAuthorization(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                // Politique pour les administrateurs
                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireRole("Admin"));

                // Politique pour les utilisateurs authentifiés
                options.AddPolicy("AuthenticatedUser", policy =>
                    policy.RequireAuthenticatedUser());

                // Politique pour les vendeurs et administrateurs
                options.AddPolicy("VendorOrAdmin", policy =>
                    policy.RequireRole("Vendeur", "Admin"));

                // Politique pour les acheteurs et administrateurs
                options.AddPolicy("BuyerOrAdmin", policy =>
                    policy.RequireRole("Acheteur", "Admin"));

                // Politique pour les comptables et administrateurs
                options.AddPolicy("AccountantOrAdmin", policy =>
                    policy.RequireRole("Comptable", "Admin"));

                // Politique pour les RH et administrateurs
                options.AddPolicy("HROrAdmin", policy =>
                    policy.RequireRole("RH", "Admin"));
            });

            return services;
        }
    }
}
