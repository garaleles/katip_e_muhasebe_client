import { Pipe, PipeTransform } from '@angular/core';
import {CheckModel} from "../models/check.model";
import {CheckDetailModel} from "../models/check-detail.model";

@Pipe({
  name: 'checkDetail',
  standalone: true
})
export class CheckDetailPipe implements PipeTransform {

  transform(value: CheckDetailModel[], search: string): CheckDetailModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.dueDate.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.type.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.amount.toString().includes(search) ||
      p.issuedCustomer.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.issuedBank.toLocaleLowerCase().includes(search.toLocaleLowerCase())||
      p.collectedDate.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.issuedDate.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.CollectedCustomer.toLocaleLowerCase().includes(search.toLocaleLowerCase())

    );
  }

}
