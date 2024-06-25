import { Pipe, PipeTransform } from '@angular/core';
import {CheckRegisterPayrollDetailModel} from "../models/check-register-payroll-detail.model";
import {CompanyCheckAccountModel} from "../models/company-check-account.model";

@Pipe({
  name: 'companyCheckAccount',
  standalone: true
})
export class CompanyCheckAccountPipe implements PipeTransform {
  transform(value: CompanyCheckAccountModel[], search: string): CompanyCheckAccountModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.bankName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.branchName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.amount.toString().toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.accountNumber.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.accountName.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
