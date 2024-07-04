import {CheckType} from "./check-type.enum";
import {CheckDetail} from "./check-detail.model";
import {CheckStatusEnum} from "./chequeissue-payroll.model";

export class Check {
  id:string = '';
  checkType: CheckType = CheckType.Inward;
  status: CheckStatusEnum = CheckStatusEnum.InPortfolio;
  dueDate: string = '';
  checkNumber: string = '';
  bankName: string = '';
  branchName: string = '';
  accountNumber: string = '';
  amount: number = 0;
  debtor: string = '';
  creditor: string = '';
  endorser: string = '';
  checkRegisterPayrollId: string = '';
  updatedDate?: string = '';
  checkDetails?: CheckDetail[];
}

