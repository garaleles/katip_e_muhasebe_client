import { Pipe, PipeTransform } from '@angular/core';
import {CheckRegisterPayroll} from "../models/check-register-payroll.model";
import {CompanyCheckissuePayrollModel} from "../models/company-checkissue-payroll.model";

@Pipe({
  name: 'companyCheckissuePayroll',
  standalone: true
})
export class CompanyCheckissuePayrollPipe implements PipeTransform {

  transform(value: CompanyCheckissuePayrollModel[], search: string): CompanyCheckissuePayrollModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.date.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.payrollAmount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.payrollNumber.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.customer?.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.averageMaturityDate.toLocaleString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.checkCount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase())
     /* p.CompanyCheckAccount?.amount ||
      p.CompanyCheckAccount?.checkNumber ||
      p.CompanyCheckAccount?.dueDate ||
      p.CompanyCheckAccount?.bankName ||
      p.CompanyCheckAccount?.branchName*/
    );
  }

}
