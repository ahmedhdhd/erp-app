using App.Models;
using App.Models.DTOs;

namespace App.Data.Interfaces
{
    public interface IAuthDAO
    {
        // ========== USER MANAGEMENT ==========
        Task<Utilisateur?> GetUserByUsernameAsync(string nomUtilisateur);
        Task<Utilisateur?> GetUserByIdAsync(int id);
        Task<Utilisateur?> GetUserByEmployeeIdAsync(int employeId);
        Task<List<Utilisateur>> GetAllUsersAsync();
        Task<List<Utilisateur>> GetUsersByRoleAsync(string role);
        Task<Utilisateur> CreateUserAsync(Utilisateur utilisateur);
        Task<Utilisateur> UpdateUserAsync(Utilisateur utilisateur);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> DeactivateUserAsync(int id);
        Task<bool> ActivateUserAsync(int id);

        // ========== AUTHENTICATION ==========
        Task<bool> ValidateCredentialsAsync(string nomUtilisateur, string motDePasse);
        Task<bool> ChangePasswordAsync(int userId, string nouveauMotDePasse);
        Task<bool> ResetPasswordAsync(int userId, string nouveauMotDePasse);
        Task<bool> IsUsernameAvailableAsync(string nomUtilisateur);
        Task<bool> IsEmailAvailableAsync(string email);

        // ========== EMPLOYEE RELATIONSHIP ==========
        Task<Employe?> GetEmployeeByIdAsync(int employeId);
        Task<bool> IsEmployeeLinkedToUserAsync(int employeId);
        Task<List<Employe>> GetAvailableEmployeesAsync(); // Employees not linked to any user

        // ========== AUDIT LOGGING ==========
        Task LogAuthenticationAttemptAsync(int? userId, string nomUtilisateur, bool success, string ipAddress, string userAgent);
        Task LogPasswordChangeAsync(int userId, string ipAddress);
        Task LogUserCreationAsync(int userId, string createdBy, string ipAddress);
        Task LogUserDeactivationAsync(int userId, string deactivatedBy, string ipAddress);

        // ========== USER SESSION ==========
        Task UpdateLastLoginAsync(int userId, DateTime loginTime);
        Task<List<AuditLog>> GetUserActivityLogsAsync(int userId, int pageSize = 50, int pageNumber = 1);

        // ========== VALIDATION ==========
        Task<bool> ValidateUserRoleAsync(int userId, string requiredRole);
        Task<bool> IsUserActiveAsync(int userId);
        Task<bool> IsUserLockedAsync(int userId);
        Task<int> GetFailedLoginAttemptsAsync(int userId);
        Task ResetFailedLoginAttemptsAsync(int userId);
        Task IncrementFailedLoginAttemptsAsync(int userId);
    }
}
