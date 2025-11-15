using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;

        public AttendanceController(AttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet]
        public async Task<ActionResult<ClientApiResponse<AttendanceListResponse>>> GetAllAttendances(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 50)
        {
            var result = await _attendanceService.GetAllAttendancesAsync(page, pageSize);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("search")]
        public async Task<ActionResult<ClientApiResponse<AttendanceListResponse>>> SearchAttendances(
            [FromQuery] AttendanceSearchRequest request)
        {
            var result = await _attendanceService.SearchAttendancesAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientApiResponse<AttendanceDTO>>> GetAttendance(int id)
        {
            var result = await _attendanceService.GetAttendanceByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpGet("employee/{employeId}/date/{date}")]
        public async Task<ActionResult<ClientApiResponse<AttendanceDTO>>> GetAttendanceByEmployeeAndDate(
            int employeId, 
            string date)
        {
            if (!System.DateTime.TryParse(date, out var parsedDate))
            {
                return BadRequest(new ClientApiResponse<AttendanceDTO> 
                { 
                    Success = false, 
                    Message = "Invalid date format. Use YYYY-MM-DD" 
                });
            }

            var result = await _attendanceService.GetAttendanceByEmployeeAndDateAsync(employeId, parsedDate);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ClientApiResponse<AttendanceDTO>>> CreateAttendance(
            [FromBody] CreateAttendanceRequest request)
        {
            var result = await _attendanceService.CreateAttendanceAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ClientApiResponse<AttendanceDTO>>> UpdateAttendance(
            int id, 
            [FromBody] UpdateAttendanceRequest request)
        {
            var result = await _attendanceService.UpdateAttendanceAsync(id, request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ClientApiResponse<bool>>> DeleteAttendance(int id)
        {
            var result = await _attendanceService.DeleteAttendanceAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}