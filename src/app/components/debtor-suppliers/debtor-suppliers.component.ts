import {Component, OnInit} from '@angular/core';
import {BlankComponent} from "../blank/blank.component";
import {SectionComponent} from "../section/section.component";
import {TrCurrencyPipe} from "tr-currency";
import {CreditorCustomersModel} from "../../models/creditor-customers.model";
import {HttpService} from "../../services/http.service";
import {SharedModule} from "../../modules/shared.module";
import {CreditorSuppliersModel} from "../../models/creditor-suppliers.model";

@Component({
  selector: 'app-debtor-suppliers',
  standalone: true,
  imports: [
    BlankComponent,
    SectionComponent,
    TrCurrencyPipe,
    SharedModule
  ],
  templateUrl: './debtor-suppliers.component.html',
  styleUrl: './debtor-suppliers.component.css'
})
export class DebtorSuppliersComponent implements OnInit {
  data: CreditorSuppliersModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<CreditorSuppliersModel[]>("Reports/DebtorSuppliers", (res) => {
      this.data = res;
    });
  }

}
