import { Pipe, PipeTransform } from '@angular/core';
import {BankModel} from "../models/bank.model";
import {ExpenseModel} from "../models/expense.model";

@Pipe({
  name: 'expense',
  standalone: true
})
export class ExpensePipe implements PipeTransform {

  transform(value: ExpenseModel[], search: string): ExpenseModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
