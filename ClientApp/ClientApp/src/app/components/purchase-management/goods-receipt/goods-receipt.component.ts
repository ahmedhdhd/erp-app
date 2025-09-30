import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PurchaseService } from '../../../services/purchase.service';
import { 
  PurchaseOrderResponse, 
  PurchaseOrderLineResponse, 
  CreateGoodsReceiptRequest,
  CreateGoodsReceiptLine,
  GoodsReceiptResponse
} from '../../../models/purchase.models';

@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.css']
})
export class GoodsReceiptComponent implements OnInit {
  purchaseOrder: PurchaseOrderResponse | null = null;
  receiptForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private purchaseService: PurchaseService
  ) {
    // Set default date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.receiptForm = this.fb.group({
      dateReception: [today.toISOString().split('T')[0], Validators.required],
      lignes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPurchaseOrder(id);
    }
  }

  loadPurchaseOrder(id: number): void {
    this.loading = true;
    this.purchaseService.getPurchaseOrder(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.purchaseOrder = response.data;
          
          // Check if order can be received
          if (this.purchaseOrder.statut === 'Brouillon') {
            this.error = 'La commande doit être soumise avant de pouvoir recevoir des marchandises';
            this.loading = false;
            return;
          }
          
          this.initializeForm();
        } else {
          this.error = response.message || 'Erreur lors du chargement de la commande';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la commande';
        this.loading = false;
        console.error(err);
      }
    });
  }

  initializeForm(): void {
    if (!this.purchaseOrder) return;

    // Clear existing form lines
    const lignesArray = this.receiptForm.get('lignes') as FormArray;
    lignesArray.clear();

    // Add form controls for each purchase order line
    this.purchaseOrder.lignes.forEach((line, index) => {
      // Calculate already received quantities
      const alreadyReceived = this.getTotalReceivedForLine(index);
      
      // Calculate remaining quantities that can still be received
      const remainingQuantity = Math.max(0, line.quantite - alreadyReceived);
      
      lignesArray.push(this.fb.group({
        ligneCommandeId: [line.id, Validators.required],
        quantiteCommandee: [line.quantite],
        quantiteRecue: [0, [Validators.required, Validators.min(0), Validators.max(remainingQuantity)]],
        quantiteRejetee: [0, [Validators.required, Validators.min(0)]], // Will be validated dynamically
        motifRejet: ['']
      }));
    });
  }

  get lignes(): FormArray {
    return this.receiptForm.get('lignes') as FormArray;
  }

  getLine(index: number): FormGroup {
    return this.lignes.at(index) as FormGroup;
  }

  onQuantityChange(index: number): void {
    const line = this.getLine(index);
    let quantiteRecue = line.get('quantiteRecue')?.value || 0;
    const quantiteCommandee = line.get('quantiteCommandee')?.value || 0;
    
    // Ensure quantity received is not negative
    if (quantiteRecue < 0) {
      quantiteRecue = 0;
      line.get('quantiteRecue')?.setValue(0);
    }
    
    // Get the total already received for this line from previous receptions
    const alreadyReceived = this.getTotalReceivedForLine(index);
    
    // Ensure quantity received doesn't exceed the maximum allowed
    const maxReceivable = quantiteCommandee - alreadyReceived;
    if (quantiteRecue > maxReceivable) {
      quantiteRecue = maxReceivable;
      line.get('quantiteRecue')?.setValue(maxReceivable);
    }
    
    // Automatically calculate and set the rejected quantity
    // Rejected quantity = Ordered quantity - (Already received + Currently receiving)
    const newRejectedQuantity = Math.max(0, quantiteCommandee - alreadyReceived - quantiteRecue);
    line.get('quantiteRejetee')?.setValue(newRejectedQuantity);
    
    // Update the validator for rejected quantity
    const maxRejectable = Math.max(0, quantiteCommandee - alreadyReceived - quantiteRecue);
    const quantiteRejeteeControl = line.get('quantiteRejetee');
    if (quantiteRejeteeControl) {
      quantiteRejeteeControl.setValidators([Validators.required, Validators.min(0), Validators.max(maxRejectable)]);
      quantiteRejeteeControl.updateValueAndValidity();
    }
    
    // Also trigger validation on rejected quantity field
    this.onRejectQuantityChange(index);
  }

  onRejectQuantityChange(index: number): void {
    const line = this.getLine(index);
    let quantiteRejetee = line.get('quantiteRejetee')?.value || 0;
    const quantiteCommandee = line.get('quantiteCommandee')?.value || 0;
    const quantiteRecue = line.get('quantiteRecue')?.value || 0;
    
    // Ensure quantity rejected is not negative
    if (quantiteRejetee < 0) {
      quantiteRejetee = 0;
      line.get('quantiteRejetee')?.setValue(0);
    }
    
    // Get the total already received for this line from previous receptions
    const alreadyReceived = this.getTotalReceivedForLine(index);
    
    // Ensure total received + rejected doesn't exceed ordered quantity
    const totalCurrent = quantiteRecue + quantiteRejetee;
    if (totalCurrent > quantiteCommandee) {
      // Adjust rejected quantity to respect the limit
      quantiteRejetee = quantiteCommandee - quantiteRecue;
      line.get('quantiteRejetee')?.setValue(quantiteRejetee);
    }
    
    // Ensure quantity rejected doesn't exceed the maximum allowed
    const maxRejectable = quantiteCommandee - alreadyReceived - quantiteRecue;
    if (quantiteRejetee > maxRejectable) {
      quantiteRejetee = maxRejectable;
      line.get('quantiteRejetee')?.setValue(maxRejectable);
    }
    
    // Update the validator for received quantity
    const maxReceivable = Math.max(0, quantiteCommandee - alreadyReceived - quantiteRejetee);
    const quantiteRecueControl = line.get('quantiteRecue');
    if (quantiteRecueControl) {
      quantiteRecueControl.setValidators([Validators.required, Validators.min(0), Validators.max(maxReceivable)]);
      quantiteRecueControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (!this.purchaseOrder || this.receiptForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs requis';
      return;
    }

    // Additional validation for quantities
    const formValue = this.receiptForm.value;
    let validationError = '';
    
    for (let i = 0; i < formValue.lignes.length; i++) {
      const line = formValue.lignes[i];
      const orderLine = this.purchaseOrder!.lignes[i];
      const totalQuantity = line.quantiteRecue + line.quantiteRejetee;
      
      // Check if total quantity exceeds ordered quantity
      if (totalQuantity > orderLine.quantite) {
        validationError = `La quantité totale (reçue + rejetée) pour le produit ${orderLine.produit.designation} ne peut pas dépasser la quantité commandée (${orderLine.quantite}).`;
        break;
      }
      
      // Check if quantities are negative
      if (line.quantiteRecue < 0 || line.quantiteRejetee < 0) {
        validationError = `Les quantités reçues et rejetées ne peuvent pas être négatives.`;
        break;
      }
      
      // Check if received quantity exceeds maximum allowed (ordered - already received)
      const alreadyReceived = this.getTotalReceivedForLine(i);
      const maxReceivable = orderLine.quantite - alreadyReceived;
      if (line.quantiteRecue > maxReceivable) {
        validationError = `La quantité reçue pour le produit ${orderLine.produit.designation} ne peut pas dépasser ${maxReceivable} (maximum autorisé).`;
        break;
      }
      
      // Check if rejected quantity exceeds maximum allowed
      const maxRejectable = orderLine.quantite - alreadyReceived - line.quantiteRecue;
      if (line.quantiteRejetee > maxRejectable) {
        validationError = `La quantité rejetée pour le produit ${orderLine.produit.designation} ne peut pas dépasser ${maxRejectable} (maximum autorisé).`;
        break;
      }
    }
    
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    // Validate that at least one item has been received
    const hasReceivedItems = formValue.lignes.some((line: any) => 
      line.quantiteRecue > 0 || line.quantiteRejetee > 0);
      
    if (!hasReceivedItems) {
      this.error = 'Veuillez recevoir ou rejeter au moins un article';
      this.loading = false;
      return;
    }

    // Ensure the date is in the correct format while preserving time
    const dateReception = new Date(formValue.dateReception);
    // If time is at midnight (default date input), set to current time
    if (dateReception.getHours() === 0 && dateReception.getMinutes() === 0 && dateReception.getSeconds() === 0) {
      const now = new Date();
      dateReception.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    const request: CreateGoodsReceiptRequest = {
      commandeId: this.purchaseOrder.id,
      dateReception: dateReception,
      lignes: formValue.lignes.map((line: any) => ({
        ligneCommandeId: line.ligneCommandeId,
        quantiteRecue: line.quantiteRecue,
        quantiteRejetee: line.quantiteRejetee,
        motifRejet: line.motifRejet
      } as CreateGoodsReceiptLine))
    };

    console.log('Sending request:', request);

    this.purchaseService.receiveGoods(request).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success) {
          this.successMessage = 'Réception des marchandises enregistrée avec succès';
          setTimeout(() => {
            this.router.navigate(['/purchase-orders', this.purchaseOrder?.id]);
          }, 2000);
        } else {
          this.error = response.message || 'Erreur lors de l\'enregistrement de la réception';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        if (err.status === 400) {
          this.error = err.error?.message || 'Données de réception invalides';
        } else if (err.status === 404) {
          this.error = 'Commande non trouvée';
        } else if (err.status === 403) {
          this.error = 'Accès refusé. Vérifiez vos permissions.';
        } else if (err.status === 500) {
          this.error = 'Erreur interne du serveur. Veuillez contacter l\'administrateur.';
          console.error('Server Error Details:', err);
        } else {
          this.error = `Erreur lors de l'enregistrement de la réception: ${err.message || 'Erreur inconnue'}`;
        }
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    if (this.purchaseOrder) {
      this.router.navigate(['/purchase-orders', this.purchaseOrder.id]);
    } else {
      this.router.navigate(['/purchase-orders']);
    }
  }

  getMaxReceivableQuantity(index: number): number {
    if (!this.purchaseOrder) return 0;
    
    const formLine = this.getLine(index);
    const quantiteCommandee = formLine.get('quantiteCommandee')?.value || 0;
    
    // Get the total already received for this line from previous receptions
    const alreadyReceived = this.getTotalReceivedForLine(index);
    
    // Maximum receivable is the ordered quantity minus already received
    return Math.max(0, quantiteCommandee - alreadyReceived);
  }

  getMaxRejectableQuantity(index: number): number {
    if (!this.purchaseOrder) return 0;
    
    const formLine = this.getLine(index);
    const quantiteCommandee = formLine.get('quantiteCommandee')?.value || 0;
    const currentReceived = formLine.get('quantiteRecue')?.value || 0;
    
    // Get the total already received for this line from previous receptions
    const alreadyReceived = this.getTotalReceivedForLine(index);
    
    // Maximum rejectable is the ordered quantity minus already received minus currently receiving
    return Math.max(0, quantiteCommandee - alreadyReceived - currentReceived);
  }

  getTotalReceivedForLine(index: number): number {
    if (!this.purchaseOrder) return 0;
    
    const line = this.purchaseOrder.lignes[index];
    if (!line) return 0;
    
    // Calculate total previously received for this line across all receptions
    let totalReceived = 0;
    if (this.purchaseOrder.receptions) {
      for (const reception of this.purchaseOrder.receptions) {
        if (reception.lignes) {
          for (const receptionLine of reception.lignes) {
            if (receptionLine.ligneCommandeId === line.id) {
              totalReceived += receptionLine.quantiteRecue;
            }
          }
        }
      }
    }
    
    return totalReceived;
  }

  getTotalRejectedForLine(index: number): number {
    if (!this.purchaseOrder) return 0;
    
    const line = this.purchaseOrder.lignes[index];
    if (!line) return 0;
    
    // Calculate total previously rejected for this line across all receptions
    let totalRejected = 0;
    if (this.purchaseOrder.receptions) {
      for (const reception of this.purchaseOrder.receptions) {
        if (reception.lignes) {
          for (const receptionLine of reception.lignes) {
            if (receptionLine.ligneCommandeId === line.id) {
              totalRejected += receptionLine.quantiteRejetee;
            }
          }
        }
      }
    }
    
    return totalRejected;
  }
}