using System.Threading.Tasks;
using App.Data;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
    public class CompanySettingsService
    {
        private readonly ICompanySettingsDAO _dao;

        public CompanySettingsService(ICompanySettingsDAO dao)
        {
            _dao = dao;
        }

        public async Task<ClientApiResponse<CompanySettingsDTO>> GetAsync()
        {
            try
            {
                var settings = await _dao.GetAsync();
                if (settings == null)
                {
                    return new ClientApiResponse<CompanySettingsDTO>
                    {
                        Success = false,
                        Message = "Paramètres de l'entreprise non trouvés",
                        Data = null
                    };
                }

                var dto = MapToDTO(settings);
                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = true,
                    Message = "Paramètres de l'entreprise récupérés avec succès",
                    Data = dto
                };
            }
            catch (System.Exception ex)
            {
                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = false,
                    Message = $"Erreur lors de la récupération des paramètres: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ClientApiResponse<CompanySettingsDTO>> CreateAsync(UpdateCompanySettingsRequest request)
        {
            try
            {
                // Check if settings already exist
                var existing = await _dao.GetAsync();
                if (existing != null)
                {
                    return new ClientApiResponse<CompanySettingsDTO>
                    {
                        Success = false,
                        Message = "Les paramètres de l'entreprise existent déjà. Utilisez la mise à jour plutôt que la création.",
                        Data = null
                    };
                }

                var settings = new CompanySettings
                {
                    NomSociete = request.NomSociete,
                    Adresse = request.Adresse,
                    Telephone = request.Telephone,
                    Email = request.Email,
                    ICE = request.ICE,
                    Devise = request.Devise,
                    TauxTVA = request.TauxTVA,
                    Logo = request.Logo
                };

                var created = await _dao.CreateAsync(settings);
                var dto = MapToDTO(created);

                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = true,
                    Message = "Paramètres de l'entreprise créés avec succès",
                    Data = dto
                };
            }
            catch (System.Exception ex)
            {
                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = false,
                    Message = $"Erreur lors de la création des paramètres: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ClientApiResponse<CompanySettingsDTO>> UpdateAsync(UpdateCompanySettingsRequest request)
        {
            try
            {
                var existing = await _dao.GetAsync();
                if (existing == null)
                {
                    return new ClientApiResponse<CompanySettingsDTO>
                    {
                        Success = false,
                        Message = "Paramètres de l'entreprise non trouvés. Créez d'abord les paramètres.",
                        Data = null
                    };
                }

                existing.NomSociete = request.NomSociete;
                existing.Adresse = request.Adresse;
                existing.Telephone = request.Telephone;
                existing.Email = request.Email;
                existing.ICE = request.ICE;
                existing.Devise = request.Devise;
                existing.TauxTVA = request.TauxTVA;
                existing.Logo = request.Logo;

                var updated = await _dao.UpdateAsync(existing);
                if (updated == null)
                {
                    return new ClientApiResponse<CompanySettingsDTO>
                    {
                        Success = false,
                        Message = "Erreur lors de la mise à jour des paramètres",
                        Data = null
                    };
                }

                var dto = MapToDTO(updated);
                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = true,
                    Message = "Paramètres de l'entreprise mis à jour avec succès",
                    Data = dto
                };
            }
            catch (System.Exception ex)
            {
                return new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = false,
                    Message = $"Erreur lors de la mise à jour des paramètres: {ex.Message}",
                    Data = null
                };
            }
        }

        private static CompanySettingsDTO MapToDTO(CompanySettings s)
        {
            return new CompanySettingsDTO
            {
                Id = s.Id,
                NomSociete = s.NomSociete,
                Adresse = s.Adresse,
                Telephone = s.Telephone,
                Email = s.Email,
                ICE = s.ICE,
                Devise = s.Devise,
                TauxTVA = s.TauxTVA,
                Logo = s.Logo,
                DateCreation = s.DateCreation,
                DateModification = s.DateModification
            };
        }
    }
}