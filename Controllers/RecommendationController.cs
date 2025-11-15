using System.Threading.Tasks;
using App.Models.DTOs;
using App.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationService _recommendationService;

        public RecommendationsController(RecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        /// <summary>
        /// Test endpoint to verify controller is working
        /// </summary>
        /// <returns>Simple test response</returns>
        [HttpGet("test")]
        public ActionResult<string> Test()
        {
            return Ok("Recommendation controller is working");
        }

        /// <summary>
        /// Train the product recommendation model on demand.
        /// </summary>
        /// <returns>Training result</returns>
        [HttpPost("train")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductApiResponse<bool>>> TrainModel()
        {
            try
            {
                var trained = await _recommendationService.TrainModelAsync();
                if (!trained)
                {
                    return BadRequest(new ProductApiResponse<bool>
                    {
                        Success = false,
                        Message = "Insufficient data to train the recommendation model.",
                        Data = false
                    });
                }

                return Ok(new ProductApiResponse<bool>
                {
                    Success = true,
                    Message = "Recommendation model trained successfully.",
                    Data = true
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new ProductApiResponse<bool>
                {
                    Success = false,
                    Message = $"Error training recommendation model: {ex.Message}",
                    Data = false
                });
            }
        }

        /// <summary>
        /// Get top recommended products
        /// </summary>
        /// <param name="count">Number of products to recommend (default: 10)</param>
        /// <returns>List of recommended products</returns>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ProductApiResponse<System.Collections.Generic.List<ProductDTO>>>> GetRecommendations([FromQuery] int count = 10)
        {
            try
            {
                var recommendations = await _recommendationService.GetTopRecommendedProductsAsync(count);
                return Ok(new ProductApiResponse<System.Collections.Generic.List<ProductDTO>>
                {
                    Success = true,
                    Message = recommendations.Count > 0
                        ? "Recommendations retrieved successfully."
                        : "No recommendations available yet. Add more sales or product data to improve insights.",
                    Data = recommendations
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new ProductApiResponse<System.Collections.Generic.List<ProductDTO>>
                {
                    Success = false,
                    Message = $"Error getting recommendations: {ex.Message}",
                    Data = null
                });
            }
        }
    }
}