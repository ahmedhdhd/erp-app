import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { Account, CreateAccount, UpdateAccount, ACCOUNT_TYPES } from '../../../models/financial.models';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  accountForm: FormGroup;
  isEditMode = false;
  accountId: number | null = null;
  accountTypes = ACCOUNT_TYPES;
  parentAccounts: Account[] = [];

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      type: ['', Validators.required],
      parentId: [null],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadParentAccounts();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.accountId = +params['id'];
        this.loadAccount();
      }
    });
  }

  loadParentAccounts(): void {
    this.financialService.getAccounts().subscribe(accounts => {
      this.parentAccounts = accounts.filter(a => a.isActive);
    });
  }

  loadAccount(): void {
    if (this.accountId) {
      this.financialService.getAccount(this.accountId).subscribe(account => {
        this.accountForm.patchValue({
          code: account.code,
          name: account.name,
          type: account.type,
          parentId: account.parentId,
          description: account.description
        });
      });
    }
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      
      if (this.isEditMode && this.accountId) {
        const updateData: UpdateAccount = {
          ...formData,
          isActive: true
        };
        this.financialService.updateAccount(this.accountId, updateData).subscribe({
          next: () => this.router.navigate(['/financial/accounts']),
          error: (error) => console.error('Error updating account:', error)
        });
      } else {
        const createData: CreateAccount = formData;
        this.financialService.createAccount(createData).subscribe({
          next: () => this.router.navigate(['/financial/accounts']),
          error: (error) => console.error('Error creating account:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/accounts']);
  }
}
