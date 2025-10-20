import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { BankAccount, CreateBankAccount, UpdateBankAccount, CURRENCIES } from '../../../models/financial.models';

@Component({
  selector: 'app-bank-account-form',
  templateUrl: './bank-account-form.component.html',
  styleUrls: ['./bank-account-form.component.css']
})
export class BankAccountFormComponent implements OnInit {
  bankAccountForm: FormGroup;
  isEditMode = false;
  bankAccountId: number | null = null;
  currencies = CURRENCIES;

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bankAccountForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.maxLength(50)]],
      bankName: ['', [Validators.required, Validators.maxLength(100)]],
      accountName: ['', [Validators.required, Validators.maxLength(100)]],
      currency: ['TND', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bankAccountId = +params['id'];
        this.loadBankAccount();
      }
    });
  }

  loadBankAccount(): void {
    if (this.bankAccountId) {
      this.financialService.getBankAccount(this.bankAccountId).subscribe((account: BankAccount) => {
        this.bankAccountForm.patchValue({
          accountNumber: account.accountNumber,
          bankName: account.bankName,
          accountName: account.accountName,
          currency: account.currency,
          description: account.description
        });
      });
    }
  }

  onSubmit(): void {
    if (this.bankAccountForm.valid) {
      const formData = this.bankAccountForm.value;
      
      if (this.isEditMode && this.bankAccountId) {
        const updateData: UpdateBankAccount = {
          ...formData,
          isActive: true
        };
        this.financialService.updateBankAccount(this.bankAccountId, updateData).subscribe({
          next: () => this.router.navigate(['/financial/bank-accounts']),
          error: (error: any) => console.error('Error updating bank account:', error)
        });
      } else {
        const createData: CreateBankAccount = formData;
        this.financialService.createBankAccount(createData).subscribe({
          next: () => this.router.navigate(['/financial/bank-accounts']),
          error: (error: any) => console.error('Error creating bank account:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/bank-accounts']);
  }
}
