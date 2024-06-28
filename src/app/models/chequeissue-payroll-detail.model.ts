import {CheckStatusEnum} from "./chequeissue-payroll.model";

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
  description?: string = '';
}

