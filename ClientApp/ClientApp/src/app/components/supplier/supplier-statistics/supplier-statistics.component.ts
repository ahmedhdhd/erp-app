import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierStatsResponse } from '../../../models/supplier.models';

@Component({
  selector: 'app-supplier-statistics',
  templateUrl: './supplier-statistics.component.html',
  styleUrls: ['./supplier-statistics.component.css']
})
export class SupplierStatisticsComponent implements OnInit {
  stats?: SupplierStatsResponse;

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.supplierService.getSupplierStats().subscribe(res => {
      if (res.success && res.data) this.stats = res.data;
    });
  }
}


