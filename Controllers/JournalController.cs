using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JournalController : ControllerBase
    {
        private readonly IJournalDAO _dao;
        public JournalController(IJournalDAO dao)
        {
            _dao = dao;
        }

        [HttpPost("search")]
        [Authorize(Roles = "Admin,Comptable,Acheteur,Vendeur")]
        public async Task<ActionResult<ClientApiResponse<JournalListResponse>>> Search([FromBody] JournalSearchRequest request)
        {
            var items = await _dao.SearchAsync(request.Type, request.OwnerId, request.DateFrom, request.DateTo, request.Page, request.PageSize, request.SortBy, request.SortDirection);
            var total = await _dao.CountAsync(request.Type, request.OwnerId, request.DateFrom, request.DateTo);
            var response = new JournalListResponse
            {
                Journaux = items,
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)System.Math.Ceiling(total / (double)request.PageSize)
            };
            return Ok(Success(response));
        }

        private static ClientApiResponse<T> Success<T>(T data)
        {
            return new ClientApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = System.DateTime.UtcNow };
        }
    }

    public class JournalListResponse
    {
        public System.Collections.Generic.List<App.Models.Journal> Journaux { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}


