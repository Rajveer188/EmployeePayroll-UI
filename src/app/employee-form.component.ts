// src/app/employee-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  employeeId!: number;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      department: ['', Validators.required],
      salary: [500, [Validators.required, Validators.min(500)]],
      startDate: ['', Validators.required],
      note: ['', Validators.required],
      profilePic: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = +id;
        this.loadEmployeeData(this.employeeId);
      }
    });
  }

  loadEmployeeData(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (emp: Employee) => {
        // Convert backend date (dd-MM-yyyy) to yyyy-MM-dd for the date input
        const [day, month, year] = emp.startDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        
        this.employeeForm.patchValue({
          ...emp,
          startDate: formattedDate
        });
      },
      error: err => console.error('Error fetching employee:', err)
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const employeeData = this.prepareFormData();
    console.log('Submitting:', employeeData);

    const operation = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId, employeeData)
      : this.employeeService.addEmployee(employeeData);

    operation.subscribe({
      next: (res) => {
        console.log('Success:', res);
        alert(`Employee ${this.isEditMode ? 'updated' : 'added'}!`);
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        console.error('Error:', err);
        alert(`Error: ${err.error?.message || 'Operation failed'}`);
      },
      complete: () => this.isSubmitting = false
    });
  }

  private prepareFormData(): Employee {
    const rawData = this.employeeForm.value;
    // Convert yyyy-MM-dd from form to dd-MM-yyyy for backend
    const [year, month, day] = rawData.startDate.split('-');
    return {
      ...rawData,
      salary: Number(rawData.salary),
      startDate: `${day}-${month}-${year}`
    };
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}