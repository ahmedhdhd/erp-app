import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface SituationFamiliale {
  id: number;
  employeId: number;
  etatCivil: string;
  chefDeFamille: boolean;
  nombreEnfants: number;
  enfantsEtudiants: number;
  enfantsHandicapes: number;
  parentsACharge: number;
  conjointACharge: boolean;
  dateDerniereMaj: string;
}

@Component({
  selector: 'app-situation-familiale',
  templateUrl: './situation-familiale.component.html',
  styleUrls: ['./situation-familiale.component.css']
})
export class SituationFamilialeComponent implements OnInit {
  situationForm: FormGroup;
  employeId: number = 0;
  isEditing: boolean = false;

  etatCivilOptions = [
    { value: 'Célibataire', label: 'Célibataire' },
    { value: 'Marié', label: 'Marié(e)' },
    { value: 'Divorcé', label: 'Divorcé(e)' },
    { value: 'Veuf', label: 'Veuf/Veuve' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.situationForm = this.fb.group({
      etatCivil: ['', Validators.required],
      chefDeFamille: [false],
      nombreEnfants: [0, [Validators.min(0)]],
      enfantsEtudiants: [0, [Validators.min(0)]],
      enfantsHandicapes: [0, [Validators.min(0)]],
      parentsACharge: [0, [Validators.min(0)]],
      conjointACharge: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeId = +params['id'];
      if (this.employeId) {
        this.loadSituationFamiliale();
      }
    });
  }

  loadSituationFamiliale(): void {
    this.http.get<SituationFamiliale>(`${environment.apiUrl}/payroll/situationfamiliale/${this.employeId}`)
      .subscribe({
        next: (data) => {
          this.situationForm.patchValue(data);
          this.isEditing = true;
        },
        error: (error) => {
          console.log('No existing family situation found for this employee');
        }
      });
  }

  onSubmit(): void {
    if (this.situationForm.valid) {
      const formData = {
        ...this.situationForm.value,
        employeId: this.employeId
      };

      if (this.isEditing) {
        // Update existing
        this.http.put(`${environment.apiUrl}/payroll/situationfamiliale/${this.employeId}`, formData)
          .subscribe({
            next: (response) => {
              alert('Situation familiale mise à jour avec succès');
            },
            error: (error) => {
              alert('Erreur lors de la mise à jour');
            }
          });
      } else {
        // Create new
        this.http.post(`${environment.apiUrl}/payroll/situationfamiliale`, formData)
          .subscribe({
            next: (response) => {
              alert('Situation familiale enregistrée avec succès');
              this.isEditing = true;
            },
            error: (error) => {
              alert('Erreur lors de l\'enregistrement');
            }
          });
      }
    }
  }

  resetForm(): void {
    this.situationForm.reset({
      etatCivil: '',
      chefDeFamille: false,
      nombreEnfants: 0,
      enfantsEtudiants: 0,
      enfantsHandicapes: 0,
      parentsACharge: 0,
      conjointACharge: false
    });
  }
}