import {Component, OnInit} from '@angular/core';
import {SharedModule} from "../../modules/shared.module";
import {ChecksInPortfolioModel} from "../../models/ChecksInPortfolio.model";
import {HttpService} from "../../services/http.service";
import {CompanyCheckReportsModel} from "../../models/CompanyCheckReports.model";

@Component({
  selector: 'app-company-check-reports',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './company-check-reports.component.html',
  styleUrl: './company-check-reports.component.css'
})
export class CompanyCheckReportsComponent implements OnInit {
  data: CompanyCheckReportsModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<CompanyCheckReportsModel[]>("Reports/CompanyChecks", (res) => {
      this.data = res;
    });
  }

}
