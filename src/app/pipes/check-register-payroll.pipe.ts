import { Pipe, PipeTransform } from '@angular/core';
import {CheckRegisterPayroll} from "../models/check-register-payroll.model";

@Pipe({
  name: 'checkRegisterPayroll',
  standalone: true
})
export class CheckRegisterPayrollPipe implements PipeTransform {

  transform(value: CheckRegisterPayroll[], search: string): CheckRegisterPayroll[] {
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
