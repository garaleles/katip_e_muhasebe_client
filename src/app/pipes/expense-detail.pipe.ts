import { Pipe, PipeTransform } from '@angular/core';
import {BankDetailModel} from "../models/bank-detail.model";
import {ExpenseDetailModel} from "../models/expense-detail.model";

@Pipe({
  name: 'expenseDetail',
  standalone: true
})
export class ExpenseDetailPipe implements PipeTransform {
  transform(value: ExpenseDetailModel[], search: string): ExpenseDetailModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
