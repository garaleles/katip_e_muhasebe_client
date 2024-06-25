import { Pipe, PipeTransform } from '@angular/core';
import {CheckRegisterPayroll} from "../models/check-register-payroll.model";
import {ChequeissuePayrollModel} from "../models/chequeissue-payroll.model";

@Pipe({
  name: 'chequeissuePayroll',
  standalone: true
})
export class ChequeissuePayrollPipe implements PipeTransform {

  transform(value: ChequeissuePayrollModel[], search: string): ChequeissuePayrollModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.date.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.payrollAmount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.payrollNumber.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.customer?.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.averageMaturityDate.toLocaleString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.checkCount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase())


    );
  }

}
