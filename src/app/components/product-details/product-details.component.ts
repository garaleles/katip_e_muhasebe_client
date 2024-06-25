import { Component } from '@angular/core';
import {HttpService} from "../../services/http.service";
import {ActivatedRoute} from "@angular/router";
import {ProductModel} from "../../models/product.model";
import {SharedModule} from "../../modules/shared.module";
import {ProductDetailPipe} from "../../pipes/product-detail.pipe";
import {ExpenseDetailPipe} from "../../pipes/expense-detail.pipe";
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [SharedModule, ProductDetailPipe, ExpenseDetailPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product: ProductModel = new ProductModel();
  productId: string = "";
  search:string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private activated: ActivatedRoute
  ){
    this.activated.params.subscribe(res=> {
      this.productId = res["id"];

      this.getAll();
    })
  }

  getAll(){
    this.http.post<ProductModel>("ProductDetails/GetAll",
      {productId: this.productId},(res)=> {
        this.product = res;
      });
  }

  calculateRunningBalance(details: any[]): any[] {
    let runningBalance = 0; // Yürüyen bakiye değişkeni

    return details.map(detail => {
      runningBalance += detail.deposit - detail.withdrawal;

      // Yeni bir nesne oluşturarak orijinal veriyi değiştirme
      return {
        ...detail,
        balance: runningBalance
      };
    });
  }
  exportToExcel() {
    const dataToExport = this.calculateRunningBalance(this.product.details).map((data, index) => {
      return {
        '#': index + 1,
        'Tarih': data.date,
        'Fatura Numarası': data.invoiceNumber,
        'Açıklama': data.description,
        'G.Miktar': data.deposit,
        'Ç.Miktar': data.withdrawal,
        'Stok Durumu': data.balance,
        'Fiyatı(Kdv Dahil)': data.grandTotal / (data.deposit + data.withdrawal),
        'Toplam Tutar(Kdv Dahil)': data.grandTotal
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Hareketleri');
    XLSX.writeFile(wb, 'Hareket.xlsx');
  }
}
