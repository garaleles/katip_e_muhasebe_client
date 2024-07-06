import {Component, OnInit} from '@angular/core';
import {SharedModule} from "../../modules/shared.module";
import {CreditorCustomersModel} from "../../models/creditor-customers.model";
import {HttpService} from "../../services/http.service";
import {CreditorSuppliersModel} from "../../models/creditor-suppliers.model";

@Component({
  selector: 'app-creditor-suppliers',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './creditor-suppliers.component.html',
  styleUrl: './creditor-suppliers.component.css'
})
export class CreditorSuppliersComponent implements OnInit {
  data: CreditorSuppliersModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<CreditorSuppliersModel[]>("Reports/CreditorSuppliers", (res) => {
      this.data = res;
    });
  }

}
