import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { JournalEntry } from '../../../models/financial.models';

@Component({
  selector: 'app-journal-entry-list',
  templateUrl: './journal-entry-list.component.html',
  styleUrls: ['./journal-entry-list.component.css']
})
export class JournalEntryListComponent implements OnInit {
  entries: JournalEntry[] = [];

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.financialService.getJournalEntries().subscribe(d => this.entries = d);
  }

  onCreateNew(): void {
    this.router.navigate(['/financial/journal-entries/new']);
  }

  onView(id: number): void {
    this.router.navigate(['/financial/journal-entries', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/financial/journal-entries/edit', id]);
  }
}


