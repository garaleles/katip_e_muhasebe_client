import {CustomerModel} from "./customer.model";

export class CompanyCheckAccount {
  id: string = '';
  dueDate: string = '';
  checkNumber: string = '';
  bankName: string = '';
  amount: number = 0;
  branchName: string = '';
  accountNumber: string = '';
  companyCheckissuePayrollId?: string | null; // Gereksiz özelliği kaldırın veya ilişkiyi düzeltin
  customerId?: string | null;
  customer: CustomerModel = new CustomerModel();
}
