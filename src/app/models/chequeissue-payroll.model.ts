import {CustomerModel} from "./customer.model";
import {Check} from "./check.model";
import {BankModel} from "./bank.model";
import {CashRegisterModel} from "./cash-register.model";
import {ChequeissuePayrollDetailModel} from "./chequeissue-payroll-detail.model";

export class ChequeissuePayrollModel{
  id: string='';
  status: CheckStatusEnum= new CheckStatusEnum();
  statusValue: number=0;
  payrollNumber: string='';
  customerId: string = "";
  customer: CustomerModel = new CustomerModel();
  checkId: string='';
  check: Check = new Check();
  payrollAmount: number=0;
  description: string='';
  checkCount: number=0;
  date: string='';
  averageMaturityDate: string='';
  bankId: string='';
  bank: BankModel = new BankModel();
  cashRegisterId: string='';
  cashRegister: CashRegisterModel = new CashRegisterModel();
  details: ChequeissuePayrollDetailModel[]=[];

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
  bankDetailId: string = '';
  cashRegisterDetailId: string = '';

}


export class CheckStatusEnum {
  Paid = 1;
  Unpaid = 2;
  Endorsed = 3;
  Returned = 4;
  Banked = 5;
  SendToBankForCollateral = 6;
  InPortfolio = 7;
}
