import {CompanyCheckAccount} from "./company-check-account.model";
import {CustomerModel} from "./customer.model";

export class CompanyCheckissuePayrollModel {
  id: string = '';
  date: string = '';
  payrollNumber: string = '';
  customerId?: string | null;
  customer: CustomerModel = new CustomerModel();
  payrollAmount: number = 0;
  description: string = '';
  checkCount: number = 0;
  averageMaturityDate: string = '';
  details: CompanyCheckAccount[] = []; // Tipini düzeltin
  checkAccounts: CompanyCheckAccount[] = []; // İlişkili CheckAccounts

  checkNumber: string = '';
  bankName: string = '';
  branchName: string = '';
  accountNumber: string = '';
  dueDate: string = '';
  amount: number = 0;

}
