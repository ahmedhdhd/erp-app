using App.Models;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        // ========== AUTHENTICATION ENDPOINTS ==========

        /// <summary>
        /// Connexion d'un utilisateur
        /// </summary>
        /// <param name="request">Informations de connexion</param>
        /// <returns>Token JWT et informations utilisateur</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Données de connexion invalides",
                        UserInfo = null
                    });
                }

                var ipAddress = GetClientIpAddress();
                var userAgent = Request.Headers["User-Agent"].ToString();

                var result = await _authService.LoginAsync(request, ipAddress, userAgent);

                if (!result.Success)
                {
                    return Unauthorized(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la connexion");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur interne est survenue"
                });
            }
        }

        /// <summary>
        /// Inscription d'un nouvel utilisateur
        /// </summary>
        /// <param name="request">Informations d'inscription</param>
        /// <returns>Résultat de l'inscription</returns>
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Données d'inscription invalides"
                    });
                }

                var ipAddress = GetClientIpAddress();
                var userAgent = Request.Headers["User-Agent"].ToString();

                var result = await _authService.RegisterAsync(request, ipAddress, userAgent);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'inscription");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur interne est survenue"
                });
            }
        }

        /// <summary>
        /// Changement de mot de passe
        /// </summary>
        /// <param name="request">Informations de changement de mot de passe</param>
        /// <returns>Résultat du changement</returns>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<AuthResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Données de changement de mot de passe invalides"
                    });
                }

                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Utilisateur non authentifié"
                    });
                }

                var ipAddress = GetClientIpAddress();
                var result = await _authService.ChangePasswordAsync(userId.Value, request, ipAddress);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du changement de mot de passe");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur interne est survenue"
                });
            }
        }

        /// <summary>
        /// Réinitialisation de mot de passe (Admin seulement)
        /// </summary>
        /// <param name="request">Informations de réinitialisation</param>
        /// <returns>Résultat de la réinitialisation</returns>
        [HttpPost("reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Données de réinitialisation invalides"
                    });
                }

                var ipAddress = GetClientIpAddress();
                var result = await _authService.ResetPasswordAsync(request, ipAddress);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la réinitialisation de mot de passe");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Une erreur interne est survenue"
                });
            }
        }

        // ========== USER MANAGEMENT ENDPOINTS ==========

        /// <summary>
        /// Récupérer le profil de l'utilisateur connecté
        /// </summary>
        /// <returns>Profil utilisateur</returns>
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfile>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var profile = await _authService.GetUserProfileAsync(userId.Value);
                if (profile == null)
                {
                    return NotFound();
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du profil");
                return StatusCode(500, "Une erreur interne est survenue");
            }
        }

        /// <summary>
        /// Récupérer tous les utilisateurs (Admin seulement)
        /// </summary>
        /// <returns>Liste des utilisateurs</returns>
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserProfile>>> GetAllUsers()
        {
            try
            {
                var users = await _authService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des utilisateurs");
                return StatusCode(500, "Une erreur interne est survenue");
            }
        }

        /// <summary>
        /// Récupérer les employés disponibles pour l'inscription
        /// </summary>
        /// <returns>Liste des employés disponibles</returns>
        [HttpGet("available-employees")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EmployeeApiResponse<List<EmployeeDTO>>>> GetAvailableEmployees()
        {
            try
            {
                // Log user info for debugging
                Console.WriteLine($"User authenticated: {User.Identity?.IsAuthenticated}");
                Console.WriteLine($"User roles: {string.Join(", ", User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(r => r.Value))}");
                
                var employees = await _authService.GetAvailableEmployeesAsync();
                Console.WriteLine($"Returning {employees.Count} employees in API response");
                
                // Map Employe entities to EmployeeDTOs for proper JSON serialization
                var employeeDTOs = employees.Select(e => new EmployeeDTO
                {
                    Id = e.Id,
                    Nom = e.Nom,
                    Prenom = e.Prenom,
                    NomComplet = ($"{e.Prenom} {e.Nom}").Trim(),
                    CIN = e.CIN,
                    Poste = e.Poste,
                    Departement = e.Departement,
                    Email = e.Email,
                    Telephone = e.Telephone,
                    SalaireBase = e.SalaireBase,
                    Prime = e.Prime,
                    SalaireTotal = e.SalaireBase + e.Prime,
                    DateEmbauche = e.DateEmbauche,
                    Statut = e.Statut,
                    HasUserAccount = e.Utilisateur != null,
                    UserRole = e.Utilisateur?.Role.ToString() ?? null,
                    DateCreation = e.DateEmbauche,
                    DateModification = e.DateEmbauche
                }).ToList();
                
                var response = new EmployeeApiResponse<List<EmployeeDTO>> 
                { 
                    Success = true, 
                    Message = "OK", 
                    Data = employeeDTOs, 
                    Timestamp = DateTime.UtcNow 
                };
                
                Console.WriteLine($"Response: Success={response.Success}, Message={response.Message}, DataCount={response.Data?.Count ?? 0}");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés disponibles");
                return StatusCode(500, new EmployeeApiResponse<List<EmployeeDTO>> 
                { 
                    Success = false, 
                    Message = "Une erreur interne est survenue", 
                    Data = null, 
                    Timestamp = DateTime.UtcNow 
                });
            }
        }

        /// <summary>
        /// Déconnexion (invalidation du token côté client)
        /// </summary>
        /// <returns>Message de déconnexion</returns>
        [HttpPost("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            // Dans une implémentation complète, vous pourriez ajouter le token à une liste noire
            // Pour l'instant, la déconnexion se fait côté client en supprimant le token
            return Ok(new { message = "Déconnexion réussie" });
        }

        /// <summary>
        /// Vérifier si un nom d'utilisateur est disponible
        /// </summary>
        /// <param name="nomUtilisateur">Nom d'utilisateur à vérifier</param>
        /// <returns>Disponibilité du nom d'utilisateur</returns>
        [HttpGet("check-username/{nomUtilisateur}")]
        [AllowAnonymous]
        public ActionResult<bool> CheckUsernameAvailability(string nomUtilisateur)
        {
            try
            {
                // Cette méthode devrait être implémentée dans AuthService
                // Pour l'instant, on retourne true
                return Ok(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification du nom d'utilisateur");
                return StatusCode(500, "Une erreur interne est survenue");
            }
        }

        // ========== HELPER METHODS ==========

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }

        private string GetClientIpAddress()
        {
            var ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = Request.Headers["X-Real-IP"].FirstOrDefault();
            }
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            }
            return ipAddress ?? "Unknown";
        }
    }
}
