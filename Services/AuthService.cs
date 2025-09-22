using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace App.Services
{
    public class AuthService
    {
        private readonly IAuthDAO _authDAO;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IAuthDAO authDAO, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _authDAO = authDAO;
            _configuration = configuration;
            _logger = logger;
        }

        // ========== AUTHENTICATION ==========
        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
        {
            try
            {
                _logger.LogInformation("Tentative de connexion pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                // Valider les identifiants
                var isValid = await _authDAO.ValidateCredentialsAsync(request.NomUtilisateur, request.MotDePasse);
                
                if (!isValid)
                {
                    await _authDAO.LogAuthenticationAttemptAsync(null, request.NomUtilisateur, false, ipAddress, userAgent);
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Nom d'utilisateur ou mot de passe incorrect"
                    };
                }

                // Récupérer l'utilisateur
                var utilisateur = await _authDAO.GetUserByUsernameAsync(request.NomUtilisateur);
                if (utilisateur == null || !utilisateur.EstActif)
                {
                    await _authDAO.LogAuthenticationAttemptAsync(null, request.NomUtilisateur, false, ipAddress, userAgent);
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Compte utilisateur inactif ou inexistant"
                    };
                }

                // Vérifier si l'utilisateur est verrouillé
                if (await _authDAO.IsUserLockedAsync(utilisateur.Id))
                {
                    await _authDAO.LogAuthenticationAttemptAsync(utilisateur.Id, request.NomUtilisateur, false, ipAddress, userAgent);
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Compte utilisateur verrouillé"
                    };
                }

                // Générer le token JWT
                var token = GenerateJwtToken(utilisateur);
                var expiration = DateTime.UtcNow.AddHours(8); // Token valide 8 heures

                // Mettre à jour la dernière connexion
                await _authDAO.UpdateLastLoginAsync(utilisateur.Id, DateTime.UtcNow);

                // Enregistrer la connexion réussie
                await _authDAO.LogAuthenticationAttemptAsync(utilisateur.Id, request.NomUtilisateur, true, ipAddress, userAgent);

                // Réinitialiser les tentatives de connexion échouées
                await _authDAO.ResetFailedLoginAttemptsAsync(utilisateur.Id);

                _logger.LogInformation("Connexion réussie pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Connexion réussie",
                    Token = token,
                    Expiration = expiration,
                    UserInfo = await GetUserInfoAsync(utilisateur)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la connexion pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur est survenue lors de la connexion"
                };
            }
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress, string userAgent)
        {
            try
            {
                _logger.LogInformation("Tentative d'inscription pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                // Vérifier que le nom d'utilisateur est disponible
                if (!await _authDAO.IsUsernameAvailableAsync(request.NomUtilisateur))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Ce nom d'utilisateur est déjà utilisé"
                    };
                }

                // Vérifier que l'employé existe et n'est pas déjà lié
                var employe = await _authDAO.GetEmployeeByIdAsync(request.EmployeId);
                if (employe == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Employé introuvable"
                    };
                }

                if (await _authDAO.IsEmployeeLinkedToUserAsync(request.EmployeId))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Cet employé est déjà lié à un utilisateur"
                    };
                }

                // Créer l'utilisateur
                var utilisateur = new Utilisateur
                {
                    NomUtilisateur = request.NomUtilisateur,
                    MotDePasse = HashPassword(request.MotDePasse),
                    Role = request.Role,
                    EmployeId = request.EmployeId,
                    EstActif = true
                };

                var createdUser = await _authDAO.CreateUserAsync(utilisateur);

                // Enregistrer la création
                await _authDAO.LogUserCreationAsync(createdUser.Id, "System", ipAddress);

                _logger.LogInformation("Inscription réussie pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Inscription réussie",
                    UserInfo = await GetUserInfoAsync(createdUser)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'inscription pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur est survenue lors de l'inscription"
                };
            }
        }

        public async Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request, string ipAddress)
        {
            try
            {
                _logger.LogInformation("Tentative de changement de mot de passe pour l'utilisateur: {UserId}", userId);

                // Vérifier l'utilisateur
                var utilisateur = await _authDAO.GetUserByIdAsync(userId);
                if (utilisateur == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Utilisateur introuvable"
                    };
                }

                // Vérifier le mot de passe actuel
                if (!await _authDAO.ValidateCredentialsAsync(utilisateur.NomUtilisateur, request.MotDePasseActuel))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Mot de passe actuel incorrect"
                    };
                }

                // Changer le mot de passe
                var success = await _authDAO.ChangePasswordAsync(userId, request.NouveauMotDePasse);
                if (!success)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Erreur lors du changement de mot de passe"
                    };
                }

                // Enregistrer le changement
                await _authDAO.LogPasswordChangeAsync(userId, ipAddress);

                _logger.LogInformation("Changement de mot de passe réussi pour l'utilisateur: {UserId}", userId);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Mot de passe changé avec succès"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du changement de mot de passe pour l'utilisateur: {UserId}", userId);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur est survenue lors du changement de mot de passe"
                };
            }
        }

        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request, string ipAddress)
        {
            try
            {
                _logger.LogInformation("Tentative de réinitialisation de mot de passe pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                // Vérifier l'utilisateur
                var utilisateur = await _authDAO.GetUserByUsernameAsync(request.NomUtilisateur);
                if (utilisateur == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Utilisateur introuvable"
                    };
                }

                // Réinitialiser le mot de passe
                var success = await _authDAO.ResetPasswordAsync(utilisateur.Id, request.NouveauMotDePasse);
                if (!success)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Erreur lors de la réinitialisation du mot de passe"
                    };
                }

                // Enregistrer la réinitialisation
                await _authDAO.LogPasswordChangeAsync(utilisateur.Id, ipAddress);

                _logger.LogInformation("Réinitialisation de mot de passe réussie pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Mot de passe réinitialisé avec succès"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la réinitialisation de mot de passe pour l'utilisateur: {NomUtilisateur}", request.NomUtilisateur);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur est survenue lors de la réinitialisation du mot de passe"
                };
            }
        }

        // ========== USER MANAGEMENT ==========
        public async Task<UserProfile?> GetUserProfileAsync(int userId)
        {
            try
            {
                var utilisateur = await _authDAO.GetUserByIdAsync(userId);
                if (utilisateur == null)
                    return null;

                return new UserProfile
                {
                    Id = utilisateur.Id,
                    NomUtilisateur = utilisateur.NomUtilisateur,
                    Role = utilisateur.Role,
                    EmployeId = utilisateur.EmployeId,
                    NomEmploye = utilisateur.Employe?.Nom ?? "",
                    PrenomEmploye = utilisateur.Employe?.Prenom ?? "",
                    Poste = utilisateur.Employe?.Poste ?? "",
                    Departement = utilisateur.Employe?.Departement ?? "",
                    Email = "", // Ajouter un champ email à la table Employe si nécessaire
                    Telephone = "", // Ajouter un champ telephone à la table Employe si nécessaire
                    DateCreation = DateTime.UtcNow, // Ajouter un champ DateCreation à la table Utilisateur
                    DerniereConnexion = DateTime.UtcNow, // Ajouter un champ DerniereConnexion à la table Utilisateur
                    EstActif = utilisateur.EstActif
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du profil utilisateur: {UserId}", userId);
                throw;
            }
        }

        public async Task<List<UserProfile>> GetAllUsersAsync()
        {
            try
            {
                var utilisateurs = await _authDAO.GetAllUsersAsync();
                var profiles = new List<UserProfile>();

                foreach (var utilisateur in utilisateurs)
                {
                    profiles.Add(new UserProfile
                    {
                        Id = utilisateur.Id,
                        NomUtilisateur = utilisateur.NomUtilisateur,
                        Role = utilisateur.Role,
                        EmployeId = utilisateur.EmployeId,
                        NomEmploye = utilisateur.Employe?.Nom ?? "",
                        PrenomEmploye = utilisateur.Employe?.Prenom ?? "",
                        Poste = utilisateur.Employe?.Poste ?? "",
                        Departement = utilisateur.Employe?.Departement ?? "",
                        Email = "",
                        Telephone = "",
                        DateCreation = DateTime.UtcNow,
                        DerniereConnexion = DateTime.UtcNow,
                        EstActif = utilisateur.EstActif
                    });
                }

                return profiles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les utilisateurs");
                throw;
            }
        }

        public async Task<List<Employe>> GetAvailableEmployeesAsync()
        {
            try
            {
                return await _authDAO.GetAvailableEmployeesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés disponibles");
                throw;
            }
        }

        // ========== HELPER METHODS ==========
        private string GenerateJwtToken(Utilisateur utilisateur)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer))
            {
                throw new InvalidOperationException("Configuration JWT manquante");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Name, utilisateur.NomUtilisateur),
                new Claim(ClaimTypes.Role, utilisateur.Role),
                new Claim("EmployeId", utilisateur.EmployeId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtIssuer,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<UserInfo> GetUserInfoAsync(Utilisateur utilisateur)
        {
            return new UserInfo
            {
                Id = utilisateur.Id,
                NomUtilisateur = utilisateur.NomUtilisateur,
                Role = utilisateur.Role,
                EmployeId = utilisateur.EmployeId,
                NomEmploye = utilisateur.Employe?.Nom ?? "",
                PrenomEmploye = utilisateur.Employe?.Prenom ?? "",
                Poste = utilisateur.Employe?.Poste ?? "",
                Departement = utilisateur.Employe?.Departement ?? "",
                DerniereConnexion = DateTime.UtcNow
            };
        }

        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}
