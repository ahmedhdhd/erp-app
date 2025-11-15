import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RecommendationService, RecommendationResponse } from '../../services/recommendation.service';
import { ProductResponse } from '../../models/product.models';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
})
export class RecommendationsComponent implements OnInit {
  recommendations: ProductResponse[] = [];
  loading = false;
  error: string | null = null;
  infoMessage: string | null = null;

  constructor(private recommendationService: RecommendationService) { }

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = null;
    this.infoMessage = null;
    
    this.recommendationService.getRecommendations(10).subscribe({
      next: (response: RecommendationResponse<ProductResponse[]>) => {
        if (response.success) {
          this.recommendations = response.data;
          this.infoMessage = response.message;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load recommendations';
        this.loading = false;
        console.error(err);
      }
    });
  }
}