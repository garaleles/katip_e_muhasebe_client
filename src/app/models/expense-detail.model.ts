import {BankModel} from "./bank.model";
import {CashRegisterModel} from "./cash-register.model";
import {ExpenseModel} from "./expense.model";

export class ExpenseDetailModel{
  id: string = "";
  withdrawalAmount: number = 0;
  balance: number = 0;
  description: string = "";
  expenseId: string = "";
  bankId: string = "";
  cashId: string = "";
  amount: number = 0;
  bankDetailId: string = "";
  expenseDetailId: string = "";
  oppositeExpenseId: string = "";
  processNumber: string | any = "";
  expense: ExpenseModel = new ExpenseModel();
  date: string = "";
  oppositeBankId: string | any = "";
  oppositeBank: BankModel = new BankModel();
  oppositeAmount: number = 0;
  recordType: number = 0;
  oppositeCashRegisterId: string | any = "";
  cashRegisterDetailId: string | any = "";
  oppositeCash: CashRegisterModel = new CashRegisterModel();
}
