import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Journal, CreateJournalDTO, UpdateJournalDTO, JournalType } from '../../../../models/financial.models';
import { FinancialService } from '../../../../services/financial.service';

@Component({
  selector: 'app-journal-form',
  templateUrl: './journal-form.component.html',
  styleUrls: ['./journal-form.component.css']
})
export class JournalFormComponent implements OnInit {
  journalForm: FormGroup;
  isEditMode = false;
  journalId: number | null = null;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Journal types for dropdown
  journalTypes = [
    { value: JournalType.Sales, label: 'Vente' },
    { value: JournalType.Purchase, label: 'Achat' },
    { value: JournalType.Bank, label: 'Banque' },
    { value: JournalType.Cash, label: 'Caisse' },
    { value: JournalType.Miscellaneous, label: 'Divers' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.journalForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: [JournalType.Sales, Validators.required],
      description: ['', Validators.maxLength(500)],
      defaultDebitAccountCode: ['', Validators.maxLength(20)],
      defaultCreditAccountCode: ['', Validators.maxLength(20)],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.journalId = +params['id'];
        this.loadJournal();
      }
    });
  }

  loadJournal(): void {
    if (!this.journalId) return;

    this.loading = true;
    this.errorMessage = null;

    this.financialService.getJournalById(this.journalId).subscribe({
      next: (journal: Journal) => {
        this.journalForm.patchValue({
          code: journal.code,
          name: journal.name,
          type: journal.type,
          description: journal.description,
          defaultDebitAccountCode: journal.defaultDebitAccountCode,
          defaultCreditAccountCode: journal.defaultCreditAccountCode,
          isActive: journal.isActive
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading journal:', error);
        this.errorMessage = 'Erreur lors du chargement du journal';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.journalForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.journalForm.value;
      
      if (this.isEditMode && this.journalId) {
        // Update existing journal
        const updateDTO: UpdateJournalDTO = {
          code: formValue.code,
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          defaultDebitAccountCode: formValue.defaultDebitAccountCode || undefined,
          defaultCreditAccountCode: formValue.defaultCreditAccountCode || undefined,
          isActive: formValue.isActive
        };

        this.financialService.updateJournal(this.journalId, updateDTO).subscribe({
          next: () => {
            this.successMessage = 'Journal mis à jour avec succès';
            this.saving = false;
            setTimeout(() => {
              this.router.navigate(['/financial/journals']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error updating journal:', error);
            this.errorMessage = 'Erreur lors de la mise à jour du journal';
            this.saving = false;
          }
        });
      } else {
        // Create new journal
        const createDTO: CreateJournalDTO = {
          code: formValue.code,
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          defaultDebitAccountCode: formValue.defaultDebitAccountCode || undefined,
          defaultCreditAccountCode: formValue.defaultCreditAccountCode || undefined,
          isActive: true
        };

        this.financialService.createJournal(createDTO).subscribe({
          next: () => {
            this.successMessage = 'Journal créé avec succès';
            this.saving = false;
            this.journalForm.reset();
            setTimeout(() => {
              this.router.navigate(['/financial/journals']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error creating journal:', error);
            this.errorMessage = 'Erreur lors de la création du journal';
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.journalForm.controls).forEach(key => {
        this.journalForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/journals']);
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadJournal();
    } else {
      this.journalForm.reset({
        type: JournalType.Sales,
        isActive: true
      });
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.journalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.journalForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${maxLength} caractères`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Code',
      name: 'Nom',
      type: 'Type',
      description: 'Description',
      defaultDebitAccountCode: 'Compte Débit par Défaut',
      defaultCreditAccountCode: 'Compte Crédit par Défaut',
      isActive: 'Statut'
    };
    return labels[fieldName] || fieldName;
  }

  getJournalTypeDisplay(type: number): string {
    const journalTypeMap: { [key: number]: string } = {
      1: 'Vente',
      2: 'Achat',
      3: 'Banque',
      4: 'Caisse',
      5: 'Divers'
    };
    return journalTypeMap[type] || 'Inconnu';
  }
}