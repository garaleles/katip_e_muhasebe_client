import { Pipe, PipeTransform } from '@angular/core';
import {ChequeissuePayrollDetailModel} from "../models/chequeissue-payroll-detail.model";

@Pipe({
  name: 'chequeissuePayrollDetail',
  standalone: true
})
export class ChequeissuePayrollDetailPipe implements PipeTransform {

  transform(value: ChequeissuePayrollDetailModel[], search: string): ChequeissuePayrollDetailModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.checkNumber.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.bankName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.branchName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.dueDate.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.amount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.endorser.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
