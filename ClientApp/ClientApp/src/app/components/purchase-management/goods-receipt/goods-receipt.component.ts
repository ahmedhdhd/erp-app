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
    this.purchaseOrder.lignes.forEach(line => {
      lignesArray.push(this.fb.group({
        ligneCommandeId: [line.id, Validators.required],
        quantiteCommandee: [line.quantite],
        quantiteRecue: [0, [Validators.required, Validators.min(0), Validators.max(line.quantite)]],
        quantiteRejetee: [0, [Validators.required, Validators.min(0)]],
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
    const quantiteRecue = line.get('quantiteRecue')?.value || 0;
    const quantiteCommandee = line.get('quantiteCommandee')?.value || 0;
    
    // Ensure rejected quantity doesn't exceed received quantity
    if (quantiteRecue + (line.get('quantiteRejetee')?.value || 0) > quantiteCommandee) {
      line.get('quantiteRejetee')?.setValue(quantiteCommandee - quantiteRecue);
    }
  }

  onRejectQuantityChange(index: number): void {
    const line = this.getLine(index);
    const quantiteRejetee = line.get('quantiteRejetee')?.value || 0;
    const quantiteCommandee = line.get('quantiteCommandee')?.value || 0;
    
    // Ensure received quantity doesn't exceed ordered quantity minus rejected quantity
    if ((line.get('quantiteRecue')?.value || 0) + quantiteRejetee > quantiteCommandee) {
      line.get('quantiteRecue')?.setValue(quantiteCommandee - quantiteRejetee);
    }
  }

  onSubmit(): void {
    if (!this.purchaseOrder || this.receiptForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.receiptForm.value;
    
    // Validate that at least one item has been received
    const hasReceivedItems = formValue.lignes.some((line: any) => 
      line.quantiteRecue > 0 || line.quantiteRejetee > 0);
      
    if (!hasReceivedItems) {
      this.error = 'Veuillez recevoir ou rejeter au moins un article';
      this.loading = false;
      return;
    }

    // Ensure the date is in the correct format
    const dateReception = new Date(formValue.dateReception);
    dateReception.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

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
}