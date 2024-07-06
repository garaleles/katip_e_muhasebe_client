import {CheckStatusEnum} from "./chequeissue-payroll.model";

export class CompanyCheckReportsModel{
  id: string = "";
  dueDate: string = "";
  checkNumber: string = "";
  bankName: string = "";
  branchName: string = "";
  accountNumber: string = "";
  amount: number = 0;
}
