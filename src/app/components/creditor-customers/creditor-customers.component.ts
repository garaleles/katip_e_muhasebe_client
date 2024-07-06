import {Component, OnInit} from '@angular/core';
import {CompanyCheckReportsModel} from "../../models/CompanyCheckReports.model";
import {HttpService} from "../../services/http.service";
import {SharedModule} from "../../modules/shared.module";
import {CreditorCustomersModel} from "../../models/creditor-customers.model";

@Component({
  selector: 'app-creditor-customers',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './creditor-customers.component.html',
  styleUrl: './creditor-customers.component.css'
})
export class CreditorCustomersComponent implements OnInit {
  data: CreditorCustomersModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<CreditorCustomersModel[]>("Reports/CreditorCustomers", (res) => {
      this.data = res;
    });
  }

}
