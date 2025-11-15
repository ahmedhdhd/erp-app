import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Employee } from '../../../models/employee.models';
import { Attendance } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  employees: Employee[] = [];
  attendances: Attendance[] = [];
  selectedDate: string = '';
  selectedEmployeeId?: number;
  selectedStatus?: string;
  isAdding: boolean = false;
  newAttendance: any = {
    employeId: null,
    date: '',
    clockInTime: null,
    clockOutTime: null,
    status: 'Present',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService
  ) {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.newAttendance.date = this.selectedDate;
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendances();
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

  loadAttendances(): void {
    const searchRequest = {
      dateFrom: this.selectedDate,
      dateTo: this.selectedDate,
      employeId: this.selectedEmployeeId,
      status: this.selectedStatus,
      page: 1,
      pageSize: 100
    };

    this.attendanceService.searchAttendances(searchRequest).subscribe({
      next: (response: any) => {
        this.attendances = response.attendances;
      },
      error: (error: any) => {
        alert('Erreur lors du chargement des présences');
        console.error(error);
      }
    });
  }

  onSearch(): void {
    this.loadAttendances();
  }

  onAddAttendance(): void {
    this.isAdding = true;
    this.newAttendance = {
      employeId: null,
      date: this.selectedDate,
      clockInTime: null,
      clockOutTime: null,
      status: 'Present',
      notes: ''
    };
  }

  onCancelAdd(): void {
    this.isAdding = false;
  }

  onSubmitAttendance(): void {
    if (!this.newAttendance.employeId) {
      alert('Veuillez sélectionner un employé');
      return;
    }

    // Prepare the data to send to the backend
    const requestData: any = {
      employeId: this.newAttendance.employeId,
      date: this.newAttendance.date,
      status: this.newAttendance.status || 'Present',
    };

    // Handle time fields - only add them if they have values
    if (this.newAttendance.clockInTime && this.newAttendance.clockInTime !== '') {
      // Combine date and time for proper DateTime format
      const clockInDateTime = new Date(`${this.newAttendance.date}T${this.newAttendance.clockInTime}`);
      requestData.clockInTime = clockInDateTime.toISOString();
    }

    if (this.newAttendance.clockOutTime && this.newAttendance.clockOutTime !== '') {
      // Combine date and time for proper DateTime format
      const clockOutDateTime = new Date(`${this.newAttendance.date}T${this.newAttendance.clockOutTime}`);
      requestData.clockOutTime = clockOutDateTime.toISOString();
    }

    // Add notes only if provided (and not empty)
    if (this.newAttendance.notes && this.newAttendance.notes.trim() !== '') {
      requestData.notes = this.newAttendance.notes.trim();
    }

    console.log('Sending request data:', requestData);

    this.attendanceService.createAttendance(requestData).subscribe({
      next: (response: any) => {
        alert('Présence enregistrée avec succès');
        this.isAdding = false;
        this.loadAttendances();
      },
      error: (error: any) => {
        alert('Erreur lors de l\'enregistrement de la présence');
        console.error('Full error:', error);
        console.error('Error details:', error.error);
      }
    });
  }

  onUpdateAttendance(attendance: Attendance): void {
    // In a real application, this would open an edit form
    alert(`Mise à jour de la présence pour ${attendance.employe?.nom} ${attendance.employe?.prenom}`);
  }

  onDeleteAttendance(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette présence ?')) {
      this.attendanceService.deleteAttendance(id).subscribe({
        next: (response: any) => {
          alert('Présence supprimée avec succès');
          this.loadAttendances();
        },
        error: (error: any) => {
          alert('Erreur lors de la suppression de la présence');
          console.error(error);
        }
      });
    }
  }

  calculateHoursWorked(attendance: Attendance): number {
    if (attendance.clockInTime && attendance.clockOutTime) {
      const start = new Date(attendance.clockInTime);
      const end = new Date(attendance.clockOutTime);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return Math.round(diff * 100) / 100;
    }
    return attendance.hoursWorked || 0;
  }
}