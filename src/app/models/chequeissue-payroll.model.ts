import {CustomerModel} from "./customer.model";
import {Check} from "./check.model";
import {BankModel} from "./bank.model";
import {CashRegisterModel} from "./cash-register.model";
import {ChequeissuePayrollDetailModel} from "./chequeissue-payroll-detail.model";
import {BankDetailModel} from "./bank-detail.model";

export class ChequeissuePayrollModel{
  id: string='';
  status: CheckStatusEnum = CheckStatusEnum.InPortfolio;
  payrollNumber: string='';
  customerId: string | null = null;
  customer: CustomerModel = new CustomerModel();
  checkId: string='';
  check: Check = new Check();
  payrollAmount: number=0;
  description: string='';
  checkCount: number=0;
  date: string='';
  averageMaturityDate: string='';
  bankId?: string | null;
  bank: BankModel = new BankModel();
  cashRegisterId?: string | null;
  cashRegister: CashRegisterModel = new CashRegisterModel();
  bankDetailId: string = '';
  bankDetail: BankDetailModel = new BankDetailModel();
  cashRegisterDetailId: string = '';
  cashRegisterDetail: CashRegisterModel = new CashRegisterModel();
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




}


export enum CheckStatusEnum {
  Paid = 1,
  Unpaid = 2,
  Endorsed = 3,
  Returned = 4,
  Banked = 5,
  SendToBankForCollateral = 6,
  InPortfolio = 7
}

export const CheckStatusEnumDescriptions = {
  [CheckStatusEnum.Paid]: "Tahsil Edildi",
  [CheckStatusEnum.Unpaid]: "Karşılıksız",
  [CheckStatusEnum.Endorsed]: "Ciro",
  [CheckStatusEnum.Returned]: "İade",
  [CheckStatusEnum.Banked]: "Bankaya Tahsile Gönder",
  [CheckStatusEnum.SendToBankForCollateral]: "Bankaya Teminata Gönder",
  [CheckStatusEnum.InPortfolio]: "Portfoyde"
};

