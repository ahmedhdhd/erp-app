using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/company/settings")]
    [Authorize]
    public class CompanySettingsController : ControllerBase
    {
        private readonly CompanySettingsService _service;

        public CompanySettingsController(CompanySettingsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<ClientApiResponse<CompanySettingsDTO>>> GetSettings()
        {
            var result = await _service.GetAsync();
            if (!result.Success && result.Message.Contains("non trouvés"))
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClientApiResponse<CompanySettingsDTO>>> CreateSettings([FromBody] UpdateCompanySettingsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = false,
                    Message = "Données de requête invalides",
                    Data = null
                });
            }

            var result = await _service.CreateAsync(request);
            if (!result.Success && result.Message.Contains("existent déjà"))
            {
                return Conflict(result);
            }
            return Ok(result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClientApiResponse<CompanySettingsDTO>>> UpdateSettings([FromBody] UpdateCompanySettingsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ClientApiResponse<CompanySettingsDTO>
                {
                    Success = false,
                    Message = "Données de requête invalides",
                    Data = null
                });
            }

            var result = await _service.UpdateAsync(request);
            if (!result.Success && result.Message.Contains("non trouvés"))
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}