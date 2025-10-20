import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { Account, CreateJournalEntry, UpdateJournalEntry, CreateJournalEntryLine } from '../../../models/financial.models';

@Component({
  selector: 'app-journal-entry-form',
  templateUrl: './journal-entry-form.component.html',
  styleUrls: ['./journal-entry-form.component.css']
})
export class JournalEntryFormComponent implements OnInit {
  journalEntryForm: FormGroup;
  isEditMode = false;
  journalEntryId: number | null = null;
  accounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.journalEntryForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      reference: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.addJournalEntryLine();
    this.addJournalEntryLine();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.journalEntryId = +params['id'];
        this.loadJournalEntry();
      }
    });
  }

  loadAccounts(): void {
    this.financialService.getAccounts().subscribe(accounts => {
      this.accounts = accounts.filter(a => a.isActive);
    });
  }

  loadJournalEntry(): void {
    if (this.journalEntryId) {
      this.financialService.getJournalEntry(this.journalEntryId).subscribe(entry => {
        this.journalEntryForm.patchValue({
          date: entry.date.split('T')[0],
          reference: entry.reference,
          description: entry.description
        });

        // Clear existing lines and add loaded lines
        const linesArray = this.journalEntryForm.get('lines') as FormArray;
        linesArray.clear();
        
        entry.lines.forEach(line => {
          this.addJournalEntryLine(line);
        });
      });
    }
  }

  get linesArray(): FormArray {
    return this.journalEntryForm.get('lines') as FormArray;
  }

  addJournalEntryLine(line?: any): void {
    const lineForm = this.fb.group({
      accountId: [line?.accountId || '', Validators.required],
      debitAmount: [line?.debitAmount || 0, [Validators.min(0)]],
      creditAmount: [line?.creditAmount || 0, [Validators.min(0)]],
      description: [line?.description || '']
    });

    this.linesArray.push(lineForm);
  }

  removeJournalEntryLine(index: number): void {
    if (this.linesArray.length > 2) {
      this.linesArray.removeAt(index);
    }
  }

  getTotalDebits(): number {
    return this.linesArray.controls.reduce((total, control) => {
      return total + (control.get('debitAmount')?.value || 0);
    }, 0);
  }

  getTotalCredits(): number {
    return this.linesArray.controls.reduce((total, control) => {
      return total + (control.get('creditAmount')?.value || 0);
    }, 0);
  }

  isBalanced(): boolean {
    return Math.abs(this.getTotalDebits() - this.getTotalCredits()) < 0.01;
  }

  onSubmit(): void {
    if (this.journalEntryForm.valid && this.isBalanced()) {
      const formData = this.journalEntryForm.value;
      const lines: CreateJournalEntryLine[] = formData.lines.map((line: any) => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount || 0,
        creditAmount: line.creditAmount || 0,
        description: line.description
      }));

      const journalEntryData = {
        date: formData.date,
        reference: formData.reference,
        description: formData.description,
        lines: lines
      };

      if (this.isEditMode && this.journalEntryId) {
        this.financialService.updateJournalEntry(this.journalEntryId, journalEntryData).subscribe({
          next: () => this.router.navigate(['/financial/journal-entries']),
          error: (error) => console.error('Error updating journal entry:', error)
        });
      } else {
        this.financialService.createJournalEntry(journalEntryData).subscribe({
          next: () => this.router.navigate(['/financial/journal-entries']),
          error: (error) => console.error('Error creating journal entry:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/journal-entries']);
  }
}
