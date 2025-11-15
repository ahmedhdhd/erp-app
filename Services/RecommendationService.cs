using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using App.Models;
using App.Models.DTOs;
using App.Data.Interfaces;
using Microsoft.ML;
using Microsoft.ML.Data;

namespace App.Services
{
    public class RecommendationService
    {
        private readonly IProductDAO _productDAO;
        private readonly MLContext _mlContext;
        private ITransformer _model;
        private readonly string _modelPath;

        public RecommendationService(IProductDAO productDAO)
        {
            _productDAO = productDAO;
            _mlContext = new MLContext(seed: 0);
            _modelPath = Path.Combine(Directory.GetCurrentDirectory(), "Models", "product_recommendation_model.zip");
        }

        public async Task<bool> TrainModelAsync()
        {
            try
            {
                // Get sales data from database
                var salesData = await PrepareTrainingDataAsync();
                
                if (salesData.Count == 0)
                {
                    return false;
                }

                // Load data into ML.NET
                var data = _mlContext.Data.LoadFromEnumerable(salesData);

                // Create pipeline
                var pipeline = _mlContext.Transforms.CopyColumns("Label", "Label")
                    .Append(_mlContext.Transforms.Concatenate("Features", 
                        "ProductId", "Category", "Price", "StockQuantity", 
                        "ProfitMargin", "Month", "DayOfWeek", "QuantitySold"))
                    .Append(_mlContext.Regression.Trainers.Sdca());

                // Train the model
                _model = pipeline.Fit(data);

                // Save the model
                Directory.CreateDirectory(Path.GetDirectoryName(_modelPath));
                _mlContext.Model.Save(_model, data.Schema, _modelPath);

                return true;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine($"Error training model: {ex.Message}");
                return false;
            }
        }

        public float PredictProductScore(ProductSaleData productData)
        {
            if (_model == null)
            {
                LoadModel();
            }

            if (_model == null)
            {
                throw new InvalidOperationException("Model not loaded");
            }

            var predictionEngine = _mlContext.Model.CreatePredictionEngine<ProductSaleData, ProductRecommendationPrediction>(_model);
            var prediction = predictionEngine.Predict(productData);
            return prediction.Score;
        }

        public async Task<List<ProductDTO>> GetTopRecommendedProductsAsync(int topN = 10)
        {
            if (!await EnsureModelAsync())
                return new List<ProductDTO>();

            // Get all active products
            var (products, _) = await _productDAO.GetAllAsync(1, 1000);
            var productDTOs = products.Select(MapToDTO).ToList();

            var predictionEngine = _mlContext.Model.CreatePredictionEngine<ProductSaleData, ProductRecommendationPrediction>(_model);

            var productScores = new List<(ProductDTO Product, float Score)>();

            foreach (var product in productDTOs)
            {
                // Create input data for prediction
                var productData = new ProductSaleData
                {
                    ProductId = product.Id,
                    Category = GetCategoryValue(product.Categorie),
                    Price = (float)product.PrixVente,
                    StockQuantity = product.StockActuel,
                    ProfitMargin = (float)product.PourcentageMarge,
                    Month = DateTime.Now.Month,
                    DayOfWeek = (float)DateTime.Now.DayOfWeek,
                    QuantitySold = 0, // This will be predicted
                    Label = 0
                };

                try
                {
                    var prediction = predictionEngine.Predict(productData);
                    productScores.Add((product, prediction.Score));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error predicting for product {product.Id}: {ex.Message}");
                }
            }

            // Sort by score descending and take top N
            return productScores
                .OrderByDescending(p => p.Score)
                .Take(topN)
                .Select(p => p.Product)
                .ToList();
        }

        private async Task<bool> EnsureModelAsync()
        {
            if (_model != null)
                return true;

            LoadModel();

            if (_model != null)
                return true;

            var trained = await TrainModelAsync();
            if (!trained)
                return false;

            LoadModel();
            return _model != null;
        }

        private void LoadModel()
        {
            if (File.Exists(_modelPath))
            {
                _model = _mlContext.Model.Load(_modelPath, out var modelInputSchema);
            }
        }

        private async Task<List<ProductSaleData>> PrepareTrainingDataAsync()
        {
            var salesData = new List<ProductSaleData>();

            // In a real implementation, you would join with sales data
            // For now, we'll create synthetic data based on product information
            var (products, _) = await _productDAO.GetAllAsync(1, 1000);
            
            var random = new Random();
            
            foreach (var product in products)
            {
                // Generate synthetic sales data for training
                for (int i = 0; i < 10; i++) // 10 data points per product
                {
                    var sale = new ProductSaleData
                    {
                        ProductId = product.Id,
                        Category = GetCategoryValue(product.Categorie),
                        Price = (float)product.PrixVente,
                        StockQuantity = product.StockActuel,
                        ProfitMargin = (float)(product.PrixVente > 0 ? Math.Round((product.PrixVente - product.PrixAchat) / product.PrixVente * 100, 2) : 0),
                        Month = random.Next(1, 13),
                        DayOfWeek = random.Next(0, 7),
                        QuantitySold = random.Next(1, 100),
                        Label = (float)((product.PrixVente > 0 ? Math.Round((product.PrixVente - product.PrixAchat) / product.PrixVente * 100, 2) : 0) * random.Next(1, 100)) // Simple label based on profit and quantity
                    };
                    
                    salesData.Add(sale);
                }
            }

            return salesData;
        }

        private float GetCategoryValue(string category)
        {
            // Simple hash-based category encoding
            return Math.Abs(category.GetHashCode() % 1000);
        }

        private ProductDTO MapToDTO(Produit p)
        {
            // Calculate HT and TTC prices
            var multiplier = 1 + (p.TauxTVA / 100);
            var prixAchatHT = Math.Round(p.PrixAchat / multiplier, 2);
            var prixVenteHT = Math.Round(p.PrixVente / multiplier, 2);
            var prixVenteMinHT = Math.Round(p.PrixVenteMin / multiplier, 2);

            var prixAchatTTC = Math.Round(p.PrixAchat * multiplier, 2);
            var prixVenteTTC = Math.Round(p.PrixVente * multiplier, 2);
            var prixVenteMinTTC = Math.Round(p.PrixVenteMin * multiplier, 2);

            return new ProductDTO
            {
                Id = p.Id,
                Reference = p.Reference,
                Designation = p.Designation,
                Description = p.Description,
                CategorieId = 0,
                Categorie = p.Categorie,
                SousCategorie = p.SousCategorie,
                PrixAchat = p.PrixAchat,
                PrixVente = p.PrixVente,
                PrixVenteMin = p.PrixVenteMin,
                TauxTVA = p.TauxTVA,
                PrixAchatHT = prixAchatHT,
                PrixVenteHT = prixVenteHT,
                PrixVenteMinHT = prixVenteMinHT,
                PrixAchatTTC = prixAchatTTC,
                PrixVenteTTC = prixVenteTTC,
                PrixVenteMinTTC = prixVenteMinTTC,
                Unite = p.Unite,
                Statut = p.Statut,
                StockActuel = p.StockActuel,
                StockMinimum = p.StockMinimum,
                StockMaximum = p.StockMaximum,
                EstStockFaible = p.StockActuel > 0 && p.StockActuel <= p.StockMinimum,
                EstRuptureStock = p.StockActuel <= 0,
                ValeurStock = p.StockActuel * p.PrixAchat,
                MargeBrute = Math.Max(0, p.PrixVente - p.PrixAchat),
                PourcentageMarge = p.PrixVente > 0 ? Math.Round((p.PrixVente - p.PrixAchat) / p.PrixVente * 100, 2) : 0,
                DateCreation = DateTime.UtcNow,
                Variantes = p.Variantes?.Select(v => new VariantDTO
                {
                    Id = v.Id,
                    ReferenceVariant = v.ReferenceVariant,
                    Couleur = v.Couleur,
                    Taille = v.Taille,
                    StockActuel = v.StockActuel
                }).ToList() ?? new List<VariantDTO>(),
            };
        }
    }
}