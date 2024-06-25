import {Component, ElementRef, ViewChild} from '@angular/core';
import {BankModel} from "../../models/bank.model";
import {CashRegisterModel} from "../../models/cash-register.model";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {ActivatedRoute} from "@angular/router";
import {DatePipe} from "@angular/common";
import {NgForm} from "@angular/forms";
import {SharedModule} from "../../modules/shared.module";
import {ExpenseDetailPipe} from "../../pipes/expense-detail.pipe";
import {ExpenseModel} from "../../models/expense.model";
import {ExpenseDetailModel} from "../../models/expense-detail.model";
import * as XLSX from "xlsx";



@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [SharedModule, ExpenseDetailPipe],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.css',
  providers: [DatePipe]
})
export class ExpenseDetailComponent {
  expense: ExpenseModel = new ExpenseModel();
  expenses: ExpenseModel[] = [];
  banks: BankModel[] = [];
  cashRegisters: CashRegisterModel[] = [];
  expenseId: string = "";
  search: string = "";
  startDate: string = "";
  endDate: string = "";
  p: number = 1;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: ExpenseDetailModel = new ExpenseDetailModel();
  updateModel: ExpenseDetailModel = new ExpenseDetailModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private activated: ActivatedRoute,
    private date: DatePipe
  ) {
    this.activated.params.subscribe(res => {
      this.expenseId = res["id"];
      //this.startDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
      //this.endDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
      this.createModel.date = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
      this.createModel.expenseId = this.expenseId;

      this.getAll();
      this.getAllBanks();
      this.getAllCashRegisters();
    })
  }

  getAllDates() {
    this.http.post<ExpenseModel>("ExpenseDetail/GetAll",
      {expenseId: this.expenseId, startDate: this.startDate, endDate: this.endDate}, (res) => {
        this.expense = res;
      });
  }

  getAll() {
    this.http.post<ExpenseModel>("ExpenseDetail/GetAll", {expenseId: this.expenseId}, (res) => {
      this.expense = res;
    });
  }

  getAllBanks() {
    this.http.post<BankModel[]>("Banks/GetAll", {}, (res) => {
      this.banks = res.filter(p => p.id != this.expenseId);
    });
  }

  getAllCashRegisters() {
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll", {}, (res) => {
      this.cashRegisters = res;
    });
  }



  create(form: NgForm) {
    if (form.valid) {
      this.createModel.amount = +this.createModel.amount;
      this.createModel.oppositeAmount = +this.createModel.oppositeAmount;

      if (this.createModel.recordType == 0) {
        this.createModel.oppositeBankId = null;
        this.createModel.oppositeCashRegisterId = null;

      } else if (this.createModel.recordType == 1) {
        this.createModel.oppositeCashRegisterId = null;

      } else if (this.createModel.recordType == 2) {
        this.createModel.oppositeBankId = null;

      }


      if (this.createModel.oppositeAmount === 0) this.createModel.oppositeAmount = this.createModel.amount;

      this.http.post<string>("ExpenseDetail/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new ExpenseDetailModel();
        this.createModel.date = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
        this.createModel.bankId = this.expenseId;

        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  deleteById(model: ExpenseDetailModel) {
    this.swal.callSwal("Gider hareketini Sil?", `${model.date} tarihteki ${model.description} açıklamalı hareketi silmek istiyor musunuz?`, () => {
      this.http.post<string>("ExpenseDetail/DeleteExpenseDetailById", {id: model.id}, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }

  get(model: ExpenseDetailModel) {
    this.updateModel = {...model};
    this.updateModel.amount =  this.updateModel.withdrawalAmount;
  }

  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("ExpenseDetail/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  changeCurrencyNameToSymbol(name: string) {
    if (name === "TL") return "₺";
    else if (name === "USD") return "$";
    else if (name === "EURO") return "€";
    else return "";
  }

  setOppositeBank() {
    const bank = this.banks.find(p => p.id === this.createModel.oppositeBankId);

    if (bank) {
      this.createModel.oppositeBank = bank;
    }
  }

  setOppositeCash() {
    const cash = this.cashRegisters.find(p => p.id === this.createModel.oppositeCashRegisterId);

    if (cash) {
      this.createModel.oppositeCash = cash;
    }
  }

  generateProcessNumber() {
    // 6 haneli benzersiz bir numara oluştur
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);

    // "Gider-" ile başlayan ve benzersiz numarayı içeren bir string oluştur
    this.createModel.processNumber = 'Gider-' + uniqueNumber;
  }

  calculateRunningBalance(details: any[]): any[] {
    let runningBalance = 0; // Yürüyen bakiye değişkeni

    return details.map(detail => {
      runningBalance += detail.withdrawalAmount ;

      // Yeni bir nesne oluşturarak orijinal veriyi değiştirme
      return {
        ...detail,
        balance: runningBalance
      };
    });
  }

  exportToExcel() {
    const dataToExport = this.calculateRunningBalance(this.expense.details).map((data, index) => {
      return {
        '#': index + 1,
        'Tarih': data.date,
        'İşlem Numarası': data.processNumber,
        'Açıklama': data.description,
        'Harcama': data.withdrawalAmount,
        'Bakiye': data.balance,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gider Hareketleri');
    XLSX.writeFile(wb, 'Gider Hareketleri.xlsx');
  }

}

