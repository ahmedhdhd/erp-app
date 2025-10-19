import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice, CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceType, CreateInvoiceLineDTO } from '../../../../models/financial.models';
import { FinancialService } from '../../../../services/financial.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  isEditMode = false;
  invoiceId: number | null = null;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Invoice types for dropdown
  invoiceTypes = [
    { value: InvoiceType.Sales, label: 'Vente' },
    { value: InvoiceType.Purchase, label: 'Achat' },
    { value: InvoiceType.CreditNote, label: 'Avoir' },
    { value: InvoiceType.DebitNote, label: 'Note de débit' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', [Validators.required, Validators.maxLength(50)]],
      partnerId: ['', Validators.required],
      journalId: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      dueDate: [''],
      type: [InvoiceType.Sales, Validators.required],
      notes: ['', Validators.maxLength(500)],
      reference: ['', Validators.maxLength(50)],
      lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Initialize with one line
    this.addLine();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.invoiceId = +params['id'];
        this.loadInvoice();
      }
    });
  }

  loadInvoice(): void {
    if (!this.invoiceId) return;

    this.loading = true;
    this.errorMessage = null;

    this.financialService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice: Invoice) => {
        this.invoiceForm.patchValue({
          invoiceNumber: invoice.invoiceNumber,
          partnerId: invoice.partnerId,
          journalId: invoice.journalId,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          type: invoice.type,
          notes: invoice.notes,
          reference: invoice.reference
        });
        
        // Clear existing lines and add loaded lines
        this.clearLines();
        invoice.lines.forEach(line => {
          this.addLine(line);
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading invoice:', error);
        this.errorMessage = 'Erreur lors du chargement de la facture';
        this.loading = false;
      }
    });
  }

  get lines(): FormArray {
    return this.invoiceForm.get('lines') as FormArray;
  }

  createLine(lineData?: any): FormGroup {
    return this.fb.group({
      description: [lineData?.description || '', [Validators.required, Validators.maxLength(200)]],
      productCode: [lineData?.productCode || '', Validators.maxLength(50)],
      quantity: [lineData?.quantity || 1, [Validators.required, Validators.min(0.001)]],
      unitPrice: [lineData?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      discount: [lineData?.discount || 0, [Validators.min(0), Validators.max(100)]],
      vatRate: [lineData?.vatRate || 0, [Validators.min(0), Validators.max(100)]],
      unit: [lineData?.unit || 'Unité', Validators.maxLength(20)],
      accountCode: [lineData?.accountCode || '', Validators.maxLength(20)],
      notes: [lineData?.notes || '', Validators.maxLength(200)]
    });
  }

  addLine(lineData?: any): void {
    this.lines.push(this.createLine(lineData));
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(index);
    } else {
      // Clear the line instead of removing it
      this.lines.at(index).reset({
        description: '',
        productCode: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        vatRate: 0,
        unit: 'Unité',
        accountCode: '',
        notes: ''
      });
    }
  }

  clearLines(): void {
    while (this.lines.length > 0) {
      this.lines.removeAt(0);
    }
  }

  calculateLineTotal(index: number): number {
    const line = this.lines.at(index);
    const quantity = line.get('quantity')?.value || 0;
    const unitPrice = line.get('unitPrice')?.value || 0;
    const discount = line.get('discount')?.value || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  }

  calculateLineVATAmount(index: number): number {
    const lineTotal = this.calculateLineTotal(index);
    const vatRate = this.lines.at(index).get('vatRate')?.value || 0;
    return lineTotal * (vatRate / 100);
  }

  calculateLineTotalWithVAT(index: number): number {
    return this.calculateLineTotal(index) + this.calculateLineVATAmount(index);
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.lines.length; i++) {
      subtotal += this.calculateLineTotal(i);
    }
    return subtotal;
  }

  calculateVATAmount(): number {
    let vatAmount = 0;
    for (let i = 0; i < this.lines.length; i++) {
      vatAmount += this.calculateLineVATAmount(i);
    }
    return vatAmount;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateVATAmount();
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.invoiceForm.value;
      
      // Prepare line DTOs
      const lineDTOs: CreateInvoiceLineDTO[] = formValue.lines.map((line: any) => ({
        description: line.description,
        productCode: line.productCode || undefined,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount,
        vatRate: line.vatRate,
        unit: line.unit,
        accountCode: line.accountCode || undefined,
        notes: line.notes || undefined
      }));
      
      if (this.isEditMode && this.invoiceId) {
        // Update existing invoice
        const updateDTO: UpdateInvoiceDTO = {
          invoiceNumber: formValue.invoiceNumber,
          partnerId: formValue.partnerId,
          journalId: formValue.journalId,
          invoiceDate: formValue.invoiceDate,
          dueDate: formValue.dueDate || undefined,
          type: formValue.type,
          notes: formValue.notes || undefined,
          reference: formValue.reference || undefined
        };

        // TODO: Implement update functionality in the service
        console.log('Update invoice', updateDTO);
        this.errorMessage = 'La mise à jour des factures n\'est pas encore implémentée';
        this.saving = false;
      } else {
        // Create new invoice
        const createDTO: CreateInvoiceDTO = {
          invoiceNumber: formValue.invoiceNumber,
          partnerId: formValue.partnerId,
          journalId: formValue.journalId,
          invoiceDate: formValue.invoiceDate,
          dueDate: formValue.dueDate || undefined,
          type: formValue.type,
          notes: formValue.notes || undefined,
          reference: formValue.reference || undefined,
          lines: lineDTOs
        };

        this.financialService.createInvoice(createDTO).subscribe({
          next: () => {
            this.successMessage = 'Facture créée avec succès';
            this.saving = false;
            this.invoiceForm.reset();
            setTimeout(() => {
              this.router.navigate(['/financial/invoices']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error creating invoice:', error);
            this.errorMessage = 'Erreur lors de la création de la facture';
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
      
      // Mark all line fields as touched
      this.lines.controls.forEach(control => {
        Object.keys((control as FormGroup).controls).forEach(key => {
          (control as FormGroup).get(key)?.markAsTouched();
        });
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/invoices']);
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadInvoice();
    } else {
      this.invoiceForm.reset({
        invoiceDate: new Date(),
        type: InvoiceType.Sales
      });
      
      // Keep one empty line
      this.clearLines();
      this.addLine();
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.invoiceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isLineFieldInvalid(lineIndex: number, fieldName: string): boolean {
    const line = this.lines.at(lineIndex);
    const field = line.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.invoiceForm.get(fieldName);
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

  getLineFieldError(lineIndex: number, fieldName: string): string {
    const line = this.lines.at(lineIndex);
    const field = line.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getLineFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getLineFieldLabel(fieldName)} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (field.errors['min']) {
        return `${this.getLineFieldLabel(fieldName)} doit être positif`;
      }
      if (field.errors['max']) {
        const maxValue = field.errors['max'].max;
        return `${this.getLineFieldLabel(fieldName)} ne peut pas dépasser ${maxValue}`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      invoiceNumber: 'Numéro de facture',
      partnerId: 'Partenaire',
      journalId: 'Journal',
      invoiceDate: 'Date de facture',
      dueDate: 'Date d\'échéance',
      type: 'Type',
      notes: 'Notes',
      reference: 'Référence'
    };
    return labels[fieldName] || fieldName;
  }

  getLineFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      description: 'Description',
      productCode: 'Code produit',
      quantity: 'Quantité',
      unitPrice: 'Prix unitaire',
      discount: 'Remise (%)',
      vatRate: 'TVA (%)',
      unit: 'Unité',
      accountCode: 'Code compte',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  getInvoiceTypeDisplay(type: number): string {
    const invoiceTypeMap: { [key: number]: string } = {
      1: 'Vente',
      2: 'Achat',
      3: 'Avoir',
      4: 'Note de débit'
    };
    return invoiceTypeMap[type] || 'Inconnu';
  }
  
  // Add formatCurrency method for template access
  formatCurrency(amount: number): string {
    return this.financialService.formatCurrency(amount);
  }
}