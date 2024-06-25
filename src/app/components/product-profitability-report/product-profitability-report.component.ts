import {Component, OnInit} from '@angular/core';
import {SharedModule} from "../../modules/shared.module";
import {ProductProfitabilityModel} from "../../models/product-profitability.model";
import {HttpService} from "../../services/http.service";


@Component({
  selector: 'app-product-profitability-report',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './product-profitability-report.component.html',
  styleUrl: './product-profitability-report.component.css'
})
export class ProductProfitabilityReportComponent implements OnInit {
  data: ProductProfitabilityModel[] = [];

  constructor(private Http: HttpService) {}


  ngOnInit() {
    this.get();
  }

  get() {
    this.Http.get<ProductProfitabilityModel[]>("Reports/ProductProfitabilityReports", (res) => {
      this.data = res;
    });
  }

}
