import {Component, OnInit} from '@angular/core';
import {CreditorSuppliersModel} from "../../models/creditor-suppliers.model";
import {HttpService} from "../../services/http.service";
import {CreditorCustomersModel} from "../../models/creditor-customers.model";
import {SharedModule} from "../../modules/shared.module";

@Component({
  selector: 'app-debtor-customers',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './debtor-customers.component.html',
  styleUrl: './debtor-customers.component.css'
})
export class DebtorCustomersComponent implements OnInit {
  data: CreditorCustomersModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<CreditorCustomersModel[]>("Reports/DebtorCustomers", (res) => {
      this.data = res;
    });
  }

}
