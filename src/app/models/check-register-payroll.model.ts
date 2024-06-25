import {CheckRegisterPayrollDetail} from "./check-register-payroll-detail.model";
import {CustomerModel} from "./customer.model";

export class CheckRegisterPayroll {
  id: string = '';  // GUID
  date: string = '';  // Use ISO string format (yyyy-mm-dd)
  payrollNumber: string = '';
  customerId?: string = '';
  customer?: CustomerModel = new CustomerModel();
  payrollAmount: number = 0;
  description?: string = '';
  checkCount: number = 0;
  checkId?: string = '';
  averageMaturityDate: string = '';  // Use ISO string format (yyyy-mm-dd)
  details: CheckRegisterPayrollDetail[] = [];

  // The properties below should be part of CheckRegisterPayrollDetail, not CheckRegisterPayroll
  // Removing these as they are not relevant to CheckRegisterPayroll
   checkNumber: string = '';
   bankName: string = '';
   branchName: string = '';
   accountNumber: string = '';
  dueDate: string = '';
  amount: number = 0;
   debtor: string = '';
   creditor: string = '';
   endorser: string = '';
   bankId: string = '';
  cashRegisterId: string = '';
  status: number = 0;
}

