import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { BankPipe } from '../../pipes/bank.pipe';
import { RouterLink } from '@angular/router';
import { BankModel } from '../../models/bank.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { CurrencyTypes } from '../../models/currency-type.model';
import { NgForm } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [SharedModule, BankPipe, RouterLink],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.css'
})
export class BanksComponent {
  banks: BankModel[] = [];
  search: string = "";
  currencyTypes = CurrencyTypes;
  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  createModel: BankModel = new BankModel();
  updateModel: BankModel = new BankModel();
  constructor(
    private http: HttpService,
    private swal: SwalService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }
  getAll() {
    this.http.post<BankModel[]>("Banks/GetAll", {}, (res) => {
      this.banks = res;
    });
  }
  create(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Banks/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new BankModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  deleteById(model: BankModel) {
    this.swal.callSwal("Bankayı Sil?", `${model.name} bankasını silmek istiyor musunuz?`, () => {
      this.http.post<string>("Banks/DeleteBankById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }
  get(model: BankModel) {
    this.updateModel = { ...model };
    this.updateModel.currencyTypeValue = this.updateModel.currencyType.value;
  }
  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Banks/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  changeCurrencyNameToSymbol(name: string) {
    if (name === "TL") return "₺";
    else if (name === "USD") return "$";
    else if (name === "EUR") return "€";
    else return "";
  }
  exportToExcel() {
    const dataToExport = (this.banks).map((data, index) => {
      return {
        '#': index + 1,
        'Banka Adı': data.name,
        'Iban': data.iban,
        'Döviz Tipi': data.currencyType.name,
        'Yatırılan': data.depositAmount,
        'Çekilen': data.withdrawalAmount,
        'Bakiye': (data.depositAmount - data.withdrawalAmount)
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Banka Listesi');
    XLSX.writeFile(wb, 'Bankalar.xlsx');
  }
}
