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
  // Salary information
  salaireBase: number;
  primePresence: number;
  primeProduction: number;
  dateDerniereMaj: string; // Backend returns DateTime, but we'll handle it as string
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-situation-familiale',
  templateUrl: './situation-familiale.component.html',
  styleUrls: ['./situation-familiale.component.css']
})
export class SituationFamilialeComponent implements OnInit {
  situationForm: FormGroup;
  employeId: number = 0;
  recordId: number = 0; // Store the actual record ID
  isEditing: boolean = false;

  etatCivilOptions = [
    { value: 'Célibataire', label: 'Single' },
    { value: 'Marié', label: 'Married' },
    { value: 'Divorcé', label: 'Divorced' },
    { value: 'Veuf', label: 'Widowed' }
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
      conjointACharge: [false],
      // Salary information
      salaireBase: [0, [Validators.min(0)]],
      primePresence: [0, [Validators.min(0)]],
      primeProduction: [0, [Validators.min(0)]]
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
    this.http.get<ApiResponse<SituationFamiliale>>(`${environment.apiUrl}/payroll/situationfamiliale/${this.employeId}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.situationForm.patchValue(response.data);
            this.recordId = response.data.id; // Store the record ID
            this.isEditing = true;
          }
        },
        error: (error) => {
          console.log('No existing payroll information found for this employee');
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
        // Update existing - use the record ID, not the employee ID
        this.http.put<ApiResponse<SituationFamiliale>>(`${environment.apiUrl}/payroll/situationfamiliale/${this.recordId}`, formData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                alert('Payroll information updated successfully');
                // Refresh the data to ensure the form is populated with the updated data
                this.refreshData();
              } else {
                alert('Error updating payroll information: ' + response.message);
              }
            },
            error: (error) => {
              alert('Error updating payroll information');
              console.error(error);
            }
          });
      } else {
        // Create new
        this.http.post<ApiResponse<SituationFamiliale>>(`${environment.apiUrl}/payroll/situationfamiliale`, formData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                alert('Payroll information saved successfully');
                this.isEditing = true;
                // Reload the data to ensure the form is populated with the saved data
                this.refreshData();
              } else {
                alert('Error saving payroll information: ' + response.message);
              }
            },
            error: (error) => {
              alert('Error saving payroll information');
              console.error(error);
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
      conjointACharge: false,
      // Salary information
      salaireBase: 0,
      primePresence: 0,
      primeProduction: 0
    });
    this.isEditing = false;
  }

  refreshData(): void {
    if (this.employeId) {
      this.loadSituationFamiliale();
    }
  }
}