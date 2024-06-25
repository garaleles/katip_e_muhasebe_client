import { Component } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { CustomerDetailPipe } from '../../pipes/customer-detail.pipe';
import { CustomerModel } from '../../models/customer.model';
import { HttpService } from '../../services/http.service';
import { ActivatedRoute } from '@angular/router';
import {ExpenseDetailPipe} from "../../pipes/expense-detail.pipe";
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [SharedModule, CustomerDetailPipe, ExpenseDetailPipe],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent {
  customer: CustomerModel = new CustomerModel();
  customerId: string = "";
  search:string = "";
  balance: number = 0;
  p: number = 1;

  constructor(
    private http: HttpService,
    private activated: ActivatedRoute
  ){
    this.activated.params.subscribe(res=> {
      this.customerId = res["id"];

      this.getAll();
    })
  }

  getAll(){
    this.http.post<CustomerModel>("CustomerDetails/GetAll",
      {customerId: this.customerId},(res)=> {
        this.customer = res;
      });
  }

  calculateRunningBalance(details: any[]): any[] {
    let runningBalance = 0; // Yürüyen bakiye değişkeni

    return details.map(detail => {
      runningBalance += detail.depositAmount - detail.withdrawalAmount;

      // Yeni bir nesne oluşturarak orijinal veriyi değiştirme
      return {
        ...detail,
        balance: runningBalance
      };
    });
  }

  exportToExcel() {
    const dataToExport = this.calculateRunningBalance(this.customer.details).map((data, index) => {
      return {
        '#': index + 1,
        'Tarih': data.date,
        'İşlem Numarası': data.processNumber,
        'İşlem Türü': data.type.name,
        'Açıklama': data.description,
        'Giriş': data.depositAmount,
        'Çıkış': data.withdrawalAmount,
        'Bakiye': data.balance,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cari Hareketleri');
    XLSX.writeFile(wb, 'Cari Hareketleri.xlsx');
  }


}

