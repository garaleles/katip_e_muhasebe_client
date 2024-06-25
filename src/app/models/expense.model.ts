import {ExpenseDetailModel} from "./expense-detail.model";
import {CurrencyTypeModel} from "./currency-type.model";

export class ExpenseModel{

  id: string = "";
  name: string = "";
  withdrawalAmount: number = 0;
  description: string = "";
  currencyType: CurrencyTypeModel = new CurrencyTypeModel();
  currencyTypeValue: number = 1;
  details: ExpenseDetailModel[] = [];
}
