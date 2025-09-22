using System.ComponentModel.DataAnnotations;

namespace App.Models.DTOs
{
    // ========== AUTHENTICATION DTOs ==========
    
    public class LoginRequest
    {
        [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
        public string NomUtilisateur { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Le mot de passe est requis")]
        public string MotDePasse { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
        public string NomUtilisateur { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Le mot de passe est requis")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Le mot de passe doit contenir au moins 6 caractères")]
        public string MotDePasse { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La confirmation du mot de passe est requise")]
        [Compare("MotDePasse", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string ConfirmerMotDePasse { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Le rôle est requis")]
        public string Role { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "L'ID de l'employé est requis")]
        public int EmployeId { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Le mot de passe actuel est requis")]
        public string MotDePasseActuel { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Le nouveau mot de passe doit contenir au moins 6 caractères")]
        public string NouveauMotDePasse { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La confirmation du nouveau mot de passe est requise")]
        [Compare("NouveauMotDePasse", ErrorMessage = "Les nouveaux mots de passe ne correspondent pas")]
        public string ConfirmerNouveauMotDePasse { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
        public string NomUtilisateur { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Le nouveau mot de passe doit contenir au moins 6 caractères")]
        public string NouveauMotDePasse { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La confirmation du nouveau mot de passe est requise")]
        [Compare("NouveauMotDePasse", ErrorMessage = "Les nouveaux mots de passe ne correspondent pas")]
        public string ConfirmerNouveauMotDePasse { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public UserInfo? UserInfo { get; set; }
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string NomUtilisateur { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int EmployeId { get; set; }
        public string NomEmploye { get; set; } = string.Empty;
        public string PrenomEmploye { get; set; } = string.Empty;
        public string Poste { get; set; } = string.Empty;
        public string Departement { get; set; } = string.Empty;
        public DateTime DerniereConnexion { get; set; }
    }

    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "Le token de rafraîchissement est requis")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class UserProfile
    {
        public int Id { get; set; }
        public string NomUtilisateur { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int EmployeId { get; set; }
        public string NomEmploye { get; set; } = string.Empty;
        public string PrenomEmploye { get; set; } = string.Empty;
        public string Poste { get; set; } = string.Empty;
        public string Departement { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public DateTime DateCreation { get; set; }
        public DateTime DerniereConnexion { get; set; }
        public bool EstActif { get; set; }
    }
}
