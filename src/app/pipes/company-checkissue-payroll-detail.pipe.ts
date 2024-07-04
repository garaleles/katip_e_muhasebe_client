import { Pipe, PipeTransform } from '@angular/core';
import {CompanyCheckissuePayrollModel} from "../models/company-checkissue-payroll.model";
import {CompanyCheckissuePayrollDetailModel} from "../models/company-checkissue-payroll-detail.model";

@Pipe({
  name: 'companyCheckissuePayrollDetail',
  standalone: true
})
export class CompanyCheckissuePayrollDetailPipe implements PipeTransform {

  transform(value: CompanyCheckissuePayrollDetailModel[], search: string): CompanyCheckissuePayrollDetailModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.CompanyCheckAccount?.amount ||
      p.CompanyCheckAccount?.checkNumber ||
      p.CompanyCheckAccount?.dueDate ||
      p.CompanyCheckAccount?.bankName ||
      p.CompanyCheckAccount?.branchName
    );
  }

}
