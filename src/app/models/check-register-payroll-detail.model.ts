export class CheckRegisterPayrollDetail {
  id: string = ''; // GUID
  checkRegisterPayrollId: string = '';
  checkNumber: string = '';
  bankName: string = '';
  branchName: string = '';
  accountNumber: string = '';
  dueDate: string = '';
  amount: number = 0;
  description?: string = '';
  debtor: string = '';
  creditor: string = '';
  endorser: string = '';
}
