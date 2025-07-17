import { Button } from '@/components/ui/button';
import { Plus, Users, Building2 } from 'lucide-react';

interface HeaderProps {
  employeeCount: number;
  onAddEmployee: () => void;
}

export function Header({ employeeCount, onAddEmployee }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-primary-hover p-3 rounded-xl">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Office Management System
              </h1>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Users className="h-4 w-4 mr-2" />
                <span>{employeeCount} {employeeCount === 1 ? 'Employee' : 'Employees'}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onAddEmployee}
            className="bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>
    </header>
  );
}