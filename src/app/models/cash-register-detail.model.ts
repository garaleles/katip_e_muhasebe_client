import { BankModel } from "./bank.model";
import { CashRegisterModel } from "./cash-register.model";

export class CashRegisterDetailModel {
  id: string = ""
  cashRegisterId: string = "";
  date: string = "";
  type: number = 0;
  amount: number = 0;
  depositAmount: number = 0;
  withdrawalAmount: number = 0;
  balance: number = 0;
  cashRegisterDetailId: string = "";
  oppositeCashRegisterId: string | any = "";
  oppositeBankId: string | any = "";
  oppositeCashRegister: CashRegisterModel = new CashRegisterModel();
  oppositeBank: BankModel = new BankModel();
  oppositeCustomerId: string | any = "";
  description: string = "";
  oppositeAmount: number = 0;
  recordType: number = 0;
  bankDetailId: string  = "";
  customerDetailId: string  = "";
  processNumber: string | any = "";


}
