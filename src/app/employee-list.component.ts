// src/app/employee-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = [
    'name',
    'gender',
    'department',
    'salary',
    'startDate',
    'actions'
  ];

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => (this.employees = data),
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  onAddUser(): void {
    this.router.navigate(['/add-employee']);
  }

  onEditUser(id?: number): void {
    if (!id) return;
    this.router.navigate(['/edit-employee', id]);
  }

  onDeleteUser(id?: number): void {
    if (!id) return;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => this.fetchEmployees(),
      error: (err) => console.error('Error deleting employee:', err)
    });
  }
}
