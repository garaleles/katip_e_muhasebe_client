import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {ExpenseModel} from "../../models/expense.model";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {ExpensePipe} from "../../pipes/expense.pipe";
import {RouterLink} from "@angular/router";
import {CurrencyTypes} from "../../models/currency-type.model";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    SharedModule,
    ExpensePipe,
    RouterLink
  ],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css'
})
export class ExpenseComponent {
  expenses: ExpenseModel[] = [];
  search: string = "";
  currencyTypes = CurrencyTypes;
  p: number = 1;


  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: ExpenseModel = new ExpenseModel();
  updateModel: ExpenseModel = new ExpenseModel();

  constructor(
    private http: HttpService,
    private swal: SwalService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }
  getAll() {
    this.http.post<ExpenseModel[]>("Expense/GetAll", {}, (res) => {
      this.expenses = res;
    });
  }
  create(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Expense/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new ExpenseModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  deleteById(model: ExpenseModel) {
    this.swal.callSwal("Gider Kartını Sil?", `${model.name} kartını silmek istiyor musunuz?`, () => {
      this.http.post<string>("Expense/DeleteExpenseById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }
  get(model: ExpenseModel) {
    this.updateModel = { ...model };
    this.updateModel.currencyTypeValue = this.updateModel.currencyType.value;
  }
  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Expense/Update", this.updateModel, (res) => {
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
    const dataToExport = (this.expenses).map((data, index) => {
      return {
        '#': index + 1,
        'Gider Adı': data.name,
        'Döviz Tipi': data.currencyType.name,
        'Toplam Harcama Tutarı': data.withdrawalAmount,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gider Listesi');
    XLSX.writeFile(wb, 'Giderler.xlsx');
  }
}
