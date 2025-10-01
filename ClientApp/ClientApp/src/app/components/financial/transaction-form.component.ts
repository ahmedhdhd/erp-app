import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionCategory } from '../../models/financial.models';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  transactionForm: FormGroup;
  isEditMode: boolean = false;
  transactionId: number | null = null;
  categories: TransactionCategory[] = [];
  clients: any[] = []; // You would need to import client service
  suppliers: any[] = []; // You would need to import supplier service
  employees: any[] = []; // You would need to import employee service
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.transactionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transactionId = +params['id'];
        this.loadTransaction(this.transactionId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      dateTransaction: [new Date().toISOString().substring(0, 10), Validators.required],
      categoryId: [null],
      clientId: [null],
      fournisseurId: [null],
      employeId: [null],
      statut: ['En attente', Validators.required],
      methodePaiement: ['', Validators.required],
      reference: [''],
      notes: ['']
    });
  }

  loadCategories(): void {
    this.financialService.getAllCategories().subscribe(response => {
      if (response.success) {
        this.categories = response.data || [];
      }
    });
  }

  loadTransaction(id: number): void {
    this.loading = true;
    this.financialService.getTransactionById(id).subscribe(response => {
      if (response.success && response.data) {
        const transaction = response.data;
        this.transactionForm.patchValue({
          type: transaction.type,
          montant: transaction.montant,
          description: transaction.description,
          dateTransaction: transaction.dateTransaction.toISOString().substring(0, 10),
          categoryId: transaction.categoryId,
          clientId: transaction.clientId,
          fournisseurId: transaction.fournisseurId,
          employeId: transaction.employeId,
          statut: transaction.statut,
          methodePaiement: transaction.methodePaiement,
          reference: transaction.reference,
          notes: transaction.notes
        });
      }
      this.loading = false;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.transactionForm.invalid) {
      return;
    }

    this.loading = true;
    
    if (this.isEditMode && this.transactionId) {
      const request: UpdateTransactionRequest = {
        id: this.transactionId,
        ...this.transactionForm.value
      };
      
      this.financialService.updateTransaction(this.transactionId, request).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/financial/transactions']);
        } else {
          alert('Erreur lors de la mise à jour de la transaction');
        }
      });
    } else {
      const request: CreateTransactionRequest = this.transactionForm.value;
      
      this.financialService.createTransaction(request).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/financial/transactions']);
        } else {
          alert('Erreur lors de la création de la transaction');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/transactions']);
  }

  // Getters for easy access to form controls
  get f() { return this.transactionForm.controls; }
}