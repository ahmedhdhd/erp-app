import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { Account, CreateAccountDTO, UpdateAccountDTO, AccountType } from '../../../models/financial.models';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  accountForm: FormGroup;
  isEditMode = false;
  accountId: number | null = null;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Account types for dropdown
  accountTypes = [
    { value: AccountType.Asset, label: 'Actif' },
    { value: AccountType.Liability, label: 'Passif' },
    { value: AccountType.Equity, label: 'Capitaux propres' },
    { value: AccountType.Revenue, label: 'Produits' },
    { value: AccountType.Expense, label: 'Charges' },
    { value: AccountType.VAT, label: 'TVA' },
    { value: AccountType.Bank, label: 'Banque' },
    { value: AccountType.Cash, label: 'Caisse' },
    { value: AccountType.Receivable, label: 'Clients' },
    { value: AccountType.Payable, label: 'Fournisseurs' }
  ];

  // Available parent accounts
  parentAccounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: [AccountType.Asset, Validators.required],
      description: ['', Validators.maxLength(500)],
      parentAccountId: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadParentAccounts();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.accountId = +params['id'];
        this.loadAccount();
      }
    });
  }

  loadParentAccounts(): void {
    this.financialService.getAccounts().subscribe({
      next: (accounts) => {
        this.parentAccounts = accounts.filter(account => account.isActive);
      },
      error: (error) => {
        console.error('Error loading parent accounts:', error);
      }
    });
  }

  loadAccount(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.errorMessage = null;

    this.financialService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.accountForm.patchValue({
          code: account.code,
          name: account.name,
          type: account.type,
          description: account.description,
          parentAccountId: account.parentAccountId,
          isActive: account.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.errorMessage = 'Erreur lors du chargement du compte';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.accountForm.value;
      
      if (this.isEditMode && this.accountId) {
        // Update existing account
        const updateDTO: UpdateAccountDTO = {
          code: formValue.code,
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          parentAccountId: formValue.parentAccountId || undefined,
          isActive: formValue.isActive
        };

        this.financialService.updateAccount(this.accountId, updateDTO).subscribe({
          next: () => {
            this.successMessage = 'Compte mis à jour avec succès';
            this.saving = false;
            setTimeout(() => {
              this.router.navigate(['/financial/accounts']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error updating account:', error);
            this.errorMessage = 'Erreur lors de la mise à jour du compte';
            this.saving = false;
          }
        });
      } else {
        // Create new account
        const createDTO: CreateAccountDTO = {
          code: formValue.code,
          name: formValue.name,
          type: formValue.type,
          description: formValue.description || undefined,
          parentAccountId: formValue.parentAccountId || undefined
        };

        this.financialService.createAccount(createDTO).subscribe({
          next: () => {
            this.successMessage = 'Compte créé avec succès';
            this.saving = false;
            this.accountForm.reset();
            setTimeout(() => {
              this.router.navigate(['/financial/accounts']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error creating account:', error);
            this.errorMessage = 'Erreur lors de la création du compte';
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/accounts']);
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadAccount();
    } else {
      this.accountForm.reset({
        type: AccountType.Asset,
        isActive: true
      });
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.accountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.accountForm.get(fieldName);
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
      parentAccountId: 'Compte parent',
      isActive: 'Statut'
    };
    return labels[fieldName] || fieldName;
  }

  getAccountTypeDisplay(type: number): string {
    return this.financialService.getAccountTypeDisplay(type);
  }

  getParentAccountDisplay(account: Account): string {
    return `${account.code} - ${account.name}`;
  }
}
