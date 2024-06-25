export class ChequeissuePayrollDetailModel{
  id: string = '';
  chequeissuePayrollId: string = '';
  checkNumber: string = '';
  bankName: string = '';
  branchName: string = '';
  accountNumber: string = '';
  dueDate: string = '';
  amount: number = 0;
  debtor: string = '';
  creditor: string = '';
  endorser?: string = '';
  bankId?: string | null = null;
  bankDetailId?: string | null = null;
  cashRegisterId?: string | null = null;
  cashRegisterDetailId?: string | null = null;
  status: number = 0;
  description?: string = '';
}

