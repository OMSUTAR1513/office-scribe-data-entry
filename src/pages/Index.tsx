import { useState, useEffect } from 'react';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee';
import { employeeAPI } from '@/lib/api';
import { Header } from '@/components/Header';
import { EmployeeForm } from '@/components/EmployeeForm';
import { EmployeeList } from '@/components/EmployeeList';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load employees. Please check your database connection.',
        variant: 'destructive',
      });
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormSubmit = async (employeeData: CreateEmployeeRequest) => {
    try {
      setIsSubmitting(true);
      
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployee = await employeeAPI.update({
          ...employeeData,
          _id: editingEmployee._id!,
        });
        
        setEmployees(prev => 
          prev.map(emp => 
            emp._id === editingEmployee._id ? updatedEmployee : emp
          )
        );
        
        toast({
          title: 'Success',
          description: 'Employee updated successfully!',
        });
      } else {
        // Create new employee
        const newEmployee = await employeeAPI.create(employeeData);
        setEmployees(prev => [newEmployee, ...prev]);
        
        toast({
          title: 'Success',
          description: 'Employee added successfully!',
        });
      }
      
      setShowForm(false);
      setEditingEmployee(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingEmployee ? 'update' : 'add'} employee. Please try again.`,
        variant: 'destructive',
      });
      console.error('Error submitting employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await employeeAPI.delete(id);
      setEmployees(prev => prev.filter(emp => emp._id !== id));
      
      toast({
        title: 'Success',
        description: 'Employee deleted successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete employee. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting employee:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        employeeCount={employees.length}
        onAddEmployee={handleAddEmployee}
      />
      
      <main className="container mx-auto px-6 py-8">
        {showForm ? (
          <div className="mb-8">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading employees...</span>
              </div>
            ) : (
              <EmployeeList
                employees={employees}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                isLoading={false}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
