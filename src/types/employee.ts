export interface Employee {
  _id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  salary: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEmployeeRequest {
  name: string;
  phoneNumber: string;
  email: string;
  salary: number;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  _id: string;
}