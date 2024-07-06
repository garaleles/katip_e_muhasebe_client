import {CheckStatusEnum} from "./chequeissue-payroll.model";

export class ChecksInPortfolioModel{
  id: string = "";
  status: CheckStatusEnum = CheckStatusEnum.InPortfolio;
  dueDate: string = "";
  checkNumber: string = "";
  bankName: string = "";
  branchName: string = "";
  accountNumber: string = "";
  debtor: string = "";
  creditor: string = "";
  endorser: string = "";
  amount: number = 0;
}
