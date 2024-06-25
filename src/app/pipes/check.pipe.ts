import { Pipe, PipeTransform } from '@angular/core';
import {BankModel} from "../models/bank.model";
import {CheckModel} from "../models/check.model";

@Pipe({
  name: 'check',
  standalone: true
})
export class CheckPipe implements PipeTransform {

  transform(value: CheckModel[], search: string): CheckModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.checkNumber.includes(search)||
      p.bankName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.branchName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.date.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.dueDate.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.endorser.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.payer.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.status.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.type.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.amount.toString().includes(search) ||
      p.cashier.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
