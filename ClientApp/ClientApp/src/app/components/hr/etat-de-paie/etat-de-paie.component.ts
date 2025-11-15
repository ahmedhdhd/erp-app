import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { PayrollService } from '../../../services/payroll.service';
import { Employee } from '../../../models/employee.models';
import { EtatDePaie } from '../../../services/payroll.service';

@Component({
  selector: 'app-etat-de-paie',
  templateUrl: './etat-de-paie.component.html',
  styleUrls: ['./etat-de-paie.component.css']
})
export class EtatDePaieComponent implements OnInit {
  employees: Employee[] = [];
  payrolls: EtatDePaie[] = [];
  selectedMonth: string = '';
  isGenerating: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private payrollService: PayrollService
  ) {
    // Set default month to current month
    const today = new Date();
    this.selectedMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadPayrolls();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.employees = response.data.employees;
        } else {
          alert('Erreur lors du chargement des employés: ' + response.message);
        }
      },
      error: (error: any) => {
        alert('Erreur lors du chargement des employés');
        console.error(error);
      }
    });
  }

  loadPayrolls(): void {
    if (this.selectedMonth) {
      this.payrollService.searchEtatsDePaie({ mois: this.selectedMonth }).subscribe({
        next: (response: any) => {
          // Remove duplicates based on employee ID and keep the most recent one
          const uniquePayrolls = response.etatsDePaie
            .filter((payroll: EtatDePaie, index: number, self: EtatDePaie[]) => 
              index === self.findIndex((p: EtatDePaie) => p.employeId === payroll.employeId)
            );
          
          this.payrolls = uniquePayrolls;
          
          // If no payrolls found and not already generating, automatically generate them
          if (this.payrolls.length === 0 && !this.isGenerating) {
            this.generatePayrollForAllEmployees();
          }
        },
        error: (error: any) => {
          alert('Erreur lors du chargement des états de paie');
          console.error(error);
        }
      });
    }
  }

  generatePayrollForAllEmployees(): void {
    if (this.selectedMonth && !this.isGenerating) {
      this.isGenerating = true;
      this.payrollService.generatePayrollForAllEmployees(this.selectedMonth).subscribe({
        next: (response: any) => {
          alert('États de paie générés automatiquement');
          // Reload the payroll data
          this.loadPayrolls();
          this.isGenerating = false;
        },
        error: (error: any) => {
          alert('Erreur lors de la génération automatique des états de paie');
          console.error(error);
          this.isGenerating = false;
        }
      });
    }
  }

  onMonthChange(): void {
    this.isGenerating = false;
    this.loadPayrolls();
  }

  generatePayrollSlip(payroll: EtatDePaie): void {
    // In a real application, this would generate a PDF
    if (payroll.employe) {
      alert(`Fiche de paie pour ${payroll.employe.nom} ${payroll.employe.prenom} générée`);
    } else {
      alert(`Fiche de paie générée pour l'employé ID: ${payroll.employeId}`);
    }
  }
}