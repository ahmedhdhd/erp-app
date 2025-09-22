using Microsoft.EntityFrameworkCore;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace App.Data.Implementations
{
    public class AuthDAO : IAuthDAO
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthDAO> _logger;

        public AuthDAO(ApplicationDbContext context, ILogger<AuthDAO> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ========== USER MANAGEMENT ==========
        public async Task<Utilisateur?> GetUserByUsernameAsync(string nomUtilisateur)
        {
            try
            {
                var uname = (nomUtilisateur ?? string.Empty).Trim().ToLower();
                return await _context.Utilisateurs
                    .Include(u => u.Employe)
                    .FirstOrDefaultAsync(u => u.NomUtilisateur.ToLower() == uname);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'utilisateur par nom d'utilisateur: {NomUtilisateur}", nomUtilisateur);
                throw;
            }
        }

        public async Task<Utilisateur?> GetUserByIdAsync(int id)
        {
            try
            {
                return await _context.Utilisateurs
                    .Include(u => u.Employe)
                    .FirstOrDefaultAsync(u => u.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'utilisateur par ID: {Id}", id);
                throw;
            }
        }

        public async Task<Utilisateur?> GetUserByEmployeeIdAsync(int employeId)
        {
            try
            {
                return await _context.Utilisateurs
                    .Include(u => u.Employe)
                    .FirstOrDefaultAsync(u => u.EmployeId == employeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'utilisateur par ID employé: {EmployeId}", employeId);
                throw;
            }
        }

        public async Task<List<Utilisateur>> GetAllUsersAsync()
        {
            try
            {
                return await _context.Utilisateurs
                    .Include(u => u.Employe)
                    .Where(u => u.EstActif)
                    .OrderBy(u => u.NomUtilisateur)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les utilisateurs");
                throw;
            }
        }

        public async Task<List<Utilisateur>> GetUsersByRoleAsync(string role)
        {
            try
            {
                return await _context.Utilisateurs
                    .Include(u => u.Employe)
                    .Where(u => u.Role == role && u.EstActif)
                    .OrderBy(u => u.NomUtilisateur)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des utilisateurs par rôle: {Role}", role);
                throw;
            }
        }

        public async Task<Utilisateur> CreateUserAsync(Utilisateur utilisateur)
        {
            try
            {
                // Vérifier que l'employé n'est pas déjà lié à un utilisateur
                var existingUser = await GetUserByEmployeeIdAsync(utilisateur.EmployeId);
                if (existingUser != null)
                {
                    throw new InvalidOperationException("Cet employé est déjà lié à un utilisateur");
                }

                // Vérifier que le nom d'utilisateur est disponible
                if (!await IsUsernameAvailableAsync(utilisateur.NomUtilisateur))
                {
                    throw new InvalidOperationException("Ce nom d'utilisateur est déjà utilisé");
                }

                _context.Utilisateurs.Add(utilisateur);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Utilisateur créé avec succès: {NomUtilisateur}", utilisateur.NomUtilisateur);
                return utilisateur;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'utilisateur: {NomUtilisateur}", utilisateur.NomUtilisateur);
                throw;
            }
        }

        public async Task<Utilisateur> UpdateUserAsync(Utilisateur utilisateur)
        {
            try
            {
                _context.Utilisateurs.Update(utilisateur);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Utilisateur mis à jour avec succès: {NomUtilisateur}", utilisateur.NomUtilisateur);
                return utilisateur;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'utilisateur: {Id}", utilisateur.Id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(id);
                if (utilisateur == null)
                    return false;

                _context.Utilisateurs.Remove(utilisateur);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Utilisateur supprimé avec succès: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'utilisateur: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeactivateUserAsync(int id)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(id);
                if (utilisateur == null)
                    return false;

                utilisateur.EstActif = false;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Utilisateur désactivé avec succès: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la désactivation de l'utilisateur: {Id}", id);
                throw;
            }
        }

        public async Task<bool> ActivateUserAsync(int id)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(id);
                if (utilisateur == null)
                    return false;

                utilisateur.EstActif = true;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Utilisateur activé avec succès: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'activation de l'utilisateur: {Id}", id);
                throw;
            }
        }

        // ========== AUTHENTICATION ==========
        public async Task<bool> ValidateCredentialsAsync(string nomUtilisateur, string motDePasse)
        {
            try
            {
                var utilisateur = await GetUserByUsernameAsync(nomUtilisateur.Trim());
                if (utilisateur == null || !utilisateur.EstActif)
                    return false;

                // Support both hashed and legacy plain-text stored passwords
                var input = (motDePasse ?? string.Empty).Trim();
                var stored = (utilisateur.MotDePasse ?? string.Empty).Trim();

                var hashed = HashPassword(input);
                if (stored == hashed)
                {
                    return true;
                }
                if (stored == input)
                {
                    _logger.LogWarning("Mot de passe stocké en clair détecté pour l'utilisateur {NomUtilisateur}. Pensez à migrer vers le hashage.", nomUtilisateur);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation des identifiants: {NomUtilisateur}", nomUtilisateur);
                throw;
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, string nouveauMotDePasse)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(userId);
                if (utilisateur == null)
                    return false;

                utilisateur.MotDePasse = HashPassword(nouveauMotDePasse);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Mot de passe changé avec succès pour l'utilisateur: {Id}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du changement de mot de passe: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ResetPasswordAsync(int userId, string nouveauMotDePasse)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(userId);
                if (utilisateur == null)
                    return false;

                utilisateur.MotDePasse = HashPassword(nouveauMotDePasse);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Mot de passe réinitialisé avec succès pour l'utilisateur: {Id}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la réinitialisation du mot de passe: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> IsUsernameAvailableAsync(string nomUtilisateur)
        {
            try
            {
                return !await _context.Utilisateurs.AnyAsync(u => u.NomUtilisateur == nomUtilisateur);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la disponibilité du nom d'utilisateur: {NomUtilisateur}", nomUtilisateur);
                throw;
            }
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            try
            {
                // Vérifier dans la table des employés
                return !await _context.Employes.AnyAsync(e => e.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la disponibilité de l'email: {Email}", email);
                throw;
            }
        }

        // ========== EMPLOYEE RELATIONSHIP ==========
        public async Task<Employe?> GetEmployeeByIdAsync(int employeId)
        {
            try
            {
                return await _context.Employes.FindAsync(employeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'employé: {EmployeId}", employeId);
                throw;
            }
        }

        public async Task<bool> IsEmployeeLinkedToUserAsync(int employeId)
        {
            try
            {
                return await _context.Utilisateurs.AnyAsync(u => u.EmployeId == employeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification du lien employé-utilisateur: {EmployeId}", employeId);
                throw;
            }
        }

        public async Task<List<Employe>> GetAvailableEmployeesAsync()
        {
            try
            {
                return await _context.Employes
                    .Where(e => !_context.Utilisateurs.Any(u => u.EmployeId == e.Id))
                    .OrderBy(e => e.Nom)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés disponibles");
                throw;
            }
        }

        // ========== AUDIT LOGGING ==========
        public async Task LogAuthenticationAttemptAsync(int? userId, string nomUtilisateur, bool success, string ipAddress, string userAgent)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UtilisateurId = userId ?? 0,
                    DateAction = DateTime.UtcNow,
                    Action = success ? "Connexion réussie" : "Tentative de connexion échouée",
                    TableAffectee = "Utilisateurs",
                    AncienneValeur = "",
                    NouvelleValeur = nomUtilisateur,
                    IPAddress = ipAddress
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'enregistrement de la tentative d'authentification");
            }
        }

        public async Task LogPasswordChangeAsync(int userId, string ipAddress)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UtilisateurId = userId,
                    DateAction = DateTime.UtcNow,
                    Action = "Changement de mot de passe",
                    TableAffectee = "Utilisateurs",
                    AncienneValeur = "",
                    NouvelleValeur = "Mot de passe modifié",
                    IPAddress = ipAddress
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'enregistrement du changement de mot de passe");
            }
        }

        public async Task LogUserCreationAsync(int userId, string createdBy, string ipAddress)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UtilisateurId = userId,
                    DateAction = DateTime.UtcNow,
                    Action = "Création d'utilisateur",
                    TableAffectee = "Utilisateurs",
                    AncienneValeur = "",
                    NouvelleValeur = $"Utilisateur créé par {createdBy}",
                    IPAddress = ipAddress
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'enregistrement de la création d'utilisateur");
            }
        }

        public async Task LogUserDeactivationAsync(int userId, string deactivatedBy, string ipAddress)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UtilisateurId = userId,
                    DateAction = DateTime.UtcNow,
                    Action = "Désactivation d'utilisateur",
                    TableAffectee = "Utilisateurs",
                    AncienneValeur = "Actif",
                    NouvelleValeur = "Inactif",
                    IPAddress = ipAddress
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'enregistrement de la désactivation d'utilisateur");
            }
        }

        // ========== USER SESSION ==========
        public async Task UpdateLastLoginAsync(int userId, DateTime loginTime)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(userId);
                if (utilisateur != null)
                {
                    // Note: Vous devriez ajouter un champ DerniereConnexion à la table Utilisateur
                    // Pour l'instant, on utilise l'audit log
                    await LogAuthenticationAttemptAsync(userId, utilisateur.NomUtilisateur, true, "", "");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la dernière connexion: {UserId}", userId);
            }
        }

        public async Task<List<AuditLog>> GetUserActivityLogsAsync(int userId, int pageSize = 50, int pageNumber = 1)
        {
            try
            {
                return await _context.AuditLogs
                    .Where(a => a.UtilisateurId == userId)
                    .OrderByDescending(a => a.DateAction)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des logs d'activité: {UserId}", userId);
                throw;
            }
        }

        // ========== VALIDATION ==========
        public async Task<bool> ValidateUserRoleAsync(int userId, string requiredRole)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(userId);
                return utilisateur?.Role == requiredRole;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation du rôle: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> IsUserActiveAsync(int userId)
        {
            try
            {
                var utilisateur = await GetUserByIdAsync(userId);
                return utilisateur?.EstActif ?? false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification du statut actif: {UserId}", userId);
                throw;
            }
        }

        public Task<bool> IsUserLockedAsync(int userId)
        {
            // Implémentation basique - vous devriez ajouter un champ IsLocked à la table Utilisateur
            return Task.FromResult(false);
        }

        public Task<int> GetFailedLoginAttemptsAsync(int userId)
        {
            // Implémentation basique - vous devriez ajouter un champ FailedLoginAttempts à la table Utilisateur
            return Task.FromResult(0);
        }

        public Task ResetFailedLoginAttemptsAsync(int userId)
        {
            // Implémentation basique - vous devriez ajouter un champ FailedLoginAttempts à la table Utilisateur
            return Task.CompletedTask;
        }

        public Task IncrementFailedLoginAttemptsAsync(int userId)
        {
            // Implémentation basique - vous devriez ajouter un champ FailedLoginAttempts à la table Utilisateur
            return Task.CompletedTask;
        }

        // ========== HELPER METHODS ==========
        private string HashPassword(string password)
        {
            // Implémentation basique - utilisez BCrypt ou Argon2 en production
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}
