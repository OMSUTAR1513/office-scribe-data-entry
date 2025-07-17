
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee';

// Use Vercel serverless functions for API calls
const API_BASE = '/api/employees';

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  },

  // Get single employee
  getById: async (id: string): Promise<Employee> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }
    return response.json();
  },

  // Create new employee
  create: async (employee: CreateEmployeeRequest): Promise<Employee> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    if (!response.ok) {
      throw new Error('Failed to create employee');
    }
    return response.json();
  },

  // Update employee
  update: async (employee: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await fetch(`${API_BASE}/${employee._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    if (!response.ok) {
      throw new Error('Failed to update employee');
    }
    return response.json();
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  },
};
