import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment, CreatePaymentDTO, UpdatePaymentDTO, PaymentType, PaymentMethod } from '../../../../models/financial.models';
import { FinancialService } from '../../../../services/financial.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  isEditMode = false;
  paymentId: number | null = null;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Payment types for dropdown
  paymentTypes = [
    { value: PaymentType.Incoming, label: 'Entrant (Encaissement)' },
    { value: PaymentType.Outgoing, label: 'Sortant (Décaissement)' }
  ];

  // Payment methods for dropdown
  paymentMethods = [
    { value: PaymentMethod.Cash, label: 'Espèces' },
    { value: PaymentMethod.BankTransfer, label: 'Virement bancaire' },
    { value: PaymentMethod.Check, label: 'Chèque' },
    { value: PaymentMethod.CreditCard, label: 'Carte de crédit' },
    { value: PaymentMethod.Other, label: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.paymentForm = this.fb.group({
      paymentNumber: ['', [Validators.required, Validators.maxLength(50)]],
      partnerId: ['', Validators.required],
      journalId: ['', Validators.required],
      paymentDate: [new Date(), Validators.required],
      type: [PaymentType.Incoming, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.001)]],
      method: [PaymentMethod.Cash, Validators.required],
      bankReference: ['', Validators.maxLength(100)],
      checkNumber: ['', Validators.maxLength(50)],
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.paymentId = +params['id'];
        this.loadPayment();
      }
    });
  }

  loadPayment(): void {
    if (!this.paymentId) return;

    this.loading = true;
    this.errorMessage = null;

    this.financialService.getPaymentById(this.paymentId).subscribe({
      next: (payment: Payment) => {
        this.paymentForm.patchValue({
          paymentNumber: payment.paymentNumber,
          partnerId: payment.partnerId,
          journalId: payment.journalId,
          paymentDate: payment.paymentDate,
          type: payment.type,
          amount: payment.amount,
          method: payment.method,
          bankReference: payment.bankReference,
          checkNumber: payment.checkNumber,
          notes: payment.notes
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading payment:', error);
        this.errorMessage = 'Erreur lors du chargement du paiement';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.paymentForm.value;
      
      if (this.isEditMode && this.paymentId) {
        // Update existing payment
        const updateDTO: UpdatePaymentDTO = {
          paymentNumber: formValue.paymentNumber,
          partnerId: formValue.partnerId,
          journalId: formValue.journalId,
          paymentDate: formValue.paymentDate,
          type: formValue.type,
          amount: formValue.amount,
          method: formValue.method,
          bankReference: formValue.bankReference || undefined,
          checkNumber: formValue.checkNumber || undefined,
          notes: formValue.notes || undefined
        };

        // TODO: Implement update functionality in the service
        console.log('Update payment', updateDTO);
        this.errorMessage = 'La mise à jour des paiements n\'est pas encore implémentée';
        this.saving = false;
      } else {
        // Create new payment
        const createDTO: CreatePaymentDTO = {
          paymentNumber: formValue.paymentNumber,
          partnerId: formValue.partnerId,
          journalId: formValue.journalId,
          paymentDate: formValue.paymentDate,
          type: formValue.type,
          amount: formValue.amount,
          method: formValue.method,
          bankReference: formValue.bankReference || undefined,
          checkNumber: formValue.checkNumber || undefined,
          notes: formValue.notes || undefined
        };

        this.financialService.createPayment(createDTO).subscribe({
          next: () => {
            this.successMessage = 'Paiement créé avec succès';
            this.saving = false;
            this.paymentForm.reset({
              paymentDate: new Date(),
              type: PaymentType.Incoming,
              method: PaymentMethod.Cash,
              amount: 0
            });
            setTimeout(() => {
              this.router.navigate(['/financial/payments']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error creating payment:', error);
            this.errorMessage = 'Erreur lors de la création du paiement';
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/payments']);
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadPayment();
    } else {
      this.paymentForm.reset({
        paymentDate: new Date(),
        type: PaymentType.Incoming,
        method: PaymentMethod.Cash,
        amount: 0
      });
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} doit être positif`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      paymentNumber: 'Numéro de paiement',
      partnerId: 'Partenaire',
      journalId: 'Journal',
      paymentDate: 'Date de paiement',
      type: 'Type',
      amount: 'Montant',
      method: 'Méthode',
      bankReference: 'Référence bancaire',
      checkNumber: 'Numéro de chèque',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  getPaymentTypeDisplay(type: number): string {
    const paymentTypeMap: { [key: number]: string } = {
      1: 'Entrant',
      2: 'Sortant'
    };
    return paymentTypeMap[type] || 'Inconnu';
  }

  getPaymentMethodDisplay(method: number): string {
    const paymentMethodMap: { [key: number]: string } = {
      1: 'Espèces',
      2: 'Virement',
      3: 'Chèque',
      4: 'Carte de crédit',
      5: 'Autre'
    };
    return paymentMethodMap[method] || 'Inconnu';
  }

  // Method to show/hide specific fields based on payment method
  showBankReference(): boolean {
    const method = this.paymentForm.get('method')?.value;
    return method === PaymentMethod.BankTransfer;
  }

  showCheckNumber(): boolean {
    const method = this.paymentForm.get('method')?.value;
    return method === PaymentMethod.Check;
  }
}