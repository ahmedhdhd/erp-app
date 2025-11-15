using Microsoft.ML.Data;

namespace App.Models
{
    public class ProductSaleData
    {
        [LoadColumn(0)]
        public float ProductId { get; set; }

        [LoadColumn(1)]
        public float Category { get; set; }

        [LoadColumn(2)]
        public float Price { get; set; }

        [LoadColumn(3)]
        public float StockQuantity { get; set; }

        [LoadColumn(4)]
        public float ProfitMargin { get; set; }

        [LoadColumn(5)]
        public float Month { get; set; }

        [LoadColumn(6)]
        public float DayOfWeek { get; set; }

        [LoadColumn(7)]
        public float QuantitySold { get; set; }

        [LoadColumn(8)]
        public float Label { get; set; }
    }

    public class ProductRecommendationPrediction
    {
        [ColumnName("Score")]
        public float Score { get; set; }
    }
}