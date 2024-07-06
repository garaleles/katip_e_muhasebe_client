import {Component, OnInit} from '@angular/core';
import {ProductProfitabilityModel} from "../../models/product-profitability.model";
import {HttpService} from "../../services/http.service";
import {SharedModule} from "../../modules/shared.module";
import {ChecksInPortfolioModel} from "../../models/ChecksInPortfolio.model";

@Component({
  selector: 'app-checks-in-portfolio',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './checks-in-portfolio.component.html',
  styleUrl: './checks-in-portfolio.component.css'
})
export class ChecksInPortfolioComponent implements OnInit {
  data: ChecksInPortfolioModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<ChecksInPortfolioModel[]>("Reports/ChecksInPortfolio", (res) => {
      this.data = res;
    });
  }

}
