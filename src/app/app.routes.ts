import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutsComponent } from './components/layouts/layouts.component';
import { HomeComponent } from './components/home/home.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UsersComponent } from './components/users/users.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { CashRegistersComponent } from './components/cash-registers/cash-registers.component';
import { CashRegisterDetailsComponent } from './components/cash-register-details/cash-register-details.component';
import { BanksComponent } from './components/banks/banks.component';
import { BankDetailComponent } from './components/bank-detail/bank-detail.component';
import {CustomerComponent} from "./components/customer/customer.component";
import {CustomerDetailsComponent} from "./components/customer-details/customer-details.component";
import {ProductsComponent} from "./components/products/products.component";
import {CategoriesComponent} from "./components/categories/categories.component";
import {UnitsComponent} from "./components/units/units.component";
import {ProductDetailsComponent} from "./components/product-details/product-details.component";
import {InvoiceComponent} from "./components/invoice/invoice.component";
import {ExpenseComponent} from "./components/expense/expense.component";
import {ExpenseDetailComponent} from "./components/expense-detail/expense-detail.component";
import {
  ProductProfitabilityReportComponent
} from "./components/product-profitability-report/product-profitability-report.component";
import {CheckRegisterPayrollComponent} from "./components/check-register-payroll/check-register-payroll.component";
import {ChequeissuePayrollComponent} from "./components/chequeissue-payroll/chequeissue-payroll.component";
import {
  CompanyCheckissuePayrollComponent
} from "./components/company-checkissue-payroll/company-checkissue-payroll.component";
import {
  CompanyCheckissuePayrollDetailComponent
} from "./components/company-checkissue-payroll-detail/company-checkissue-payroll-detail.component";
import {ChecksInPortfolioComponent} from "./components/checks-in-portfolio/checks-in-portfolio.component";
import {CompanyCheckReportsComponent} from "./components/company-check-reports/company-check-reports.component";
import {DebtorCustomersComponent} from "./components/debtor-customers/debtor-customers.component";
import {CreditorCustomersComponent} from "./components/creditor-customers/creditor-customers.component";
import {CreditorSuppliersComponent} from "./components/creditor-suppliers/creditor-suppliers.component";
import {DebtorSuppliersComponent} from "./components/debtor-suppliers/debtor-suppliers.component";


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'confirm-email/:email', component: ConfirmEmailComponent },
  {
    path: '',
    component: LayoutsComponent,
    canActivateChild: [() => inject(AuthService).isAuthenticated()], // Auth kontrolü
    children: [
      { path: '', component: HomeComponent },
      { path: 'users', component: UsersComponent },
      { path: 'companies', component: CompaniesComponent },
      {
        path: 'cash-registers',
        children: [
          { path: '', component: CashRegistersComponent },
          { path: 'details/:id', component: CashRegisterDetailsComponent }
        ]
      },
      {
        path: 'banks',
        children: [
          { path: '', component: BanksComponent },
          { path: 'details/:id', component: BankDetailComponent }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: '', component: CustomerComponent },
          { path: 'details/:id', component: CustomerDetailsComponent }
        ]
      },
      {
        path: 'products',
        children: [
          { path: '', component: ProductsComponent },
          { path: 'details/:id', component: ProductDetailsComponent }
        ]
      },
      { path: 'categories', children: [{ path: '', component: CategoriesComponent }] },
      { path: 'units', children: [{ path: '', component: UnitsComponent }] },
      { path: 'invoices', component: InvoiceComponent },
      {
        path: 'expenses',
        children: [
          { path: '', component: ExpenseComponent },
          { path: 'details/:id', component: ExpenseDetailComponent }
        ]
      },
      {
        path: 'reports',
        children: [
          { path: '', redirectTo: 'product-profitability-report', pathMatch: 'full' },
          { path: 'product-profitability-report', component: ProductProfitabilityReportComponent },
          { path: 'checks-in-portfolio', component: ChecksInPortfolioComponent },
          { path: 'company-check-reports', component: CompanyCheckReportsComponent },
          { path: 'debtor-customers', component: DebtorCustomersComponent },
          { path: 'creditor-customers', component: CreditorCustomersComponent },
          { path: 'creditor-suppliers', component: CreditorSuppliersComponent },
          { path: 'debtor-suppliers', component: DebtorSuppliersComponent }
        ]
      },
      {
        path: 'check-register-payrolls',
        children: [
          { path: '', component: CheckRegisterPayrollComponent },
          { path: 'details/:id', component: CashRegisterDetailsComponent }
        ]
      },
      {
        path: 'chequeissue-payrolls',
        children: [
          { path: '', component: ChequeissuePayrollComponent },
          { path: 'details/:id', component: CashRegisterDetailsComponent } // Burayı kontrol edin
        ]
      },
      {
        path: 'company-checkissue-payrolls',
        children: [
          { path: '', component: CompanyCheckissuePayrollComponent },
          { path: 'details/:id', component: CompanyCheckissuePayrollDetailComponent }
        ]
      }
    ]
  }
];
