import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Employee {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  salaireBase: number;
  prime: number;
  dateEmbauche: string;
  statut: string;
}

interface EtatDePaie {
  id: number;
  employeId: number;
  employe: Employee;
  mois: string;
  nombreDeJours: number;
  salaireBase: number;
  primePresence: number;
  primeProduction: number;
  salaireBrut: number;
  cnss: number;
  salaireImposable: number;
  irpp: number;
  css: number;
  salaireNet: number;
  dateCreation: string;
}

@Component({
  selector: 'app-etat-de-paie',
  templateUrl: './etat-de-paie.component.html',
  styleUrls: ['./etat-de-paie.component.css']
})
export class EtatDePaieComponent implements OnInit {
  payrollForm: FormGroup;
  employees: Employee[] = [];
  payrolls: EtatDePaie[] = [];
  selectedEmployeeId: number | null = null;
  selectedMonth: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.payrollForm = this.fb.group({
      employeId: ['', Validators.required],
      mois: ['', Validators.required],
      nombreDeJours: [0, [Validators.required, Validators.min(0)]],
      salaireBase: [0, [Validators.required, Validators.min(0)]],
      primePresence: [0, [Validators.min(0)]],
      primeProduction: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    // Set default month to current month
    const today = new Date();
    this.selectedMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    this.payrollForm.patchValue({ mois: this.selectedMonth });
  }

  loadEmployees(): void {
    this.http.get<Employee[]>('/api/employees')
      .subscribe({
        next: (data) => {
          this.employees = data;
        },
        error: (error) => {
          alert('Erreur lors du chargement des employés');
        }
      });
  }

  loadPayrolls(): void {
    if (this.selectedMonth) {
      this.http.get<EtatDePaie[]>(`/api/payroll/etatdepaie/search?mois=${this.selectedMonth}`)
        .subscribe({
          next: (data) => {
            this.payrolls = data;
          },
          error: (error) => {
            alert('Erreur lors du chargement des états de paie');
          }
        });
    }
  }

  onSubmit(): void {
    if (this.payrollForm.valid) {
      const formData = this.payrollForm.value;

      this.http.post('/api/payroll/etatdepaie', formData)
        .subscribe({
          next: (response: any) => {
            alert('État de paie généré avec succès');
            // Reload the payroll list
            this.loadPayrolls();
            // Reset form
            this.payrollForm.reset({
              nombreDeJours: 0,
              primePresence: 0,
              primeProduction: 0,
              mois: this.selectedMonth
            });
          },
          error: (error) => {
            alert('Erreur lors de la génération de l\'état de paie');
          }
        });
    }
  }

  onEmployeeChange(): void {
    const employeId = this.payrollForm.get('employeId')?.value;
    if (employeId) {
      // Load employee details to pre-fill form
      const employee = this.employees.find(e => e.id === employeId);
      if (employee) {
        this.payrollForm.patchValue({
          salaireBase: employee.salaireBase
        });
      }
    }
  }

  generatePayrollSlip(payroll: EtatDePaie): void {
    // In a real application, this would generate a PDF
    alert(`Fiche de paie pour ${payroll.employe.nom} ${payroll.employe.prenom} générée`);
  }
}