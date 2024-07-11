import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {BankDetailPipe} from '../../pipes/bank-detail.pipe';
import {SharedModule} from '../../modules/shared.module';
import {BankModel} from '../../models/bank.model';
import {BankDetailModel} from '../../models/bank-detail.model';
import {HttpService} from '../../services/http.service';
import {SwalService} from '../../services/swal.service';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {NgForm} from '@angular/forms';
import {CashRegisterModel} from '../../models/cash-register.model';
import {CustomerModel} from "../../models/customer.model";
import {ExpenseDetailPipe} from "../../pipes/expense-detail.pipe";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// `uint8ArrayToBase64` fonksiyonu
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

@Component({
  selector: 'app-bank-detail',
  standalone: true,
  imports: [SharedModule, BankDetailPipe, ExpenseDetailPipe],
  templateUrl: './bank-detail.component.html',
  styleUrl: './bank-detail.component.css',
  providers: [DatePipe]
})
export class BankDetailComponent implements AfterViewInit{
  bank: BankModel = new BankModel();
  banks: BankModel[] = [];
  customers: CustomerModel[] = [];
  cashRegisters: CashRegisterModel[] = [];
  bankId: string = "";
  search: string = "";
  startDate: string = "";
  endDate: string = "";
  p: number = 1;

  pDebt: number = 1;  // Borç tablosu için sayfa numarası
  pCredit: number = 1; // Alacak tablosu için sayfa numarası
  debtEntries: BankDetailModel[] = [];
  creditEntries: BankDetailModel[] = [];
  filteredEntries: BankDetailModel[] = [];
  totalDebt: number = 0;
  totalCredit: number = 0;
  balance: number = 0;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild('tListModal') tListModal!: ElementRef;
  openTListModal() {
    // Modal açıldığında çalışacak kod
    this.filterEntries();
    this.calculateTotals();
  }

  filterEntries() {
    this.debtEntries = this.bank.details.filter(entry => entry.depositAmount > 0);
    this.creditEntries = this.bank.details.filter(entry => entry.withdrawalAmount > 0);
  }
  calculateTotals() {
    this.totalDebt = this.debtEntries.reduce((sum, entry) => sum + entry.depositAmount, 0);
    this.totalCredit = this.creditEntries.reduce((sum, entry) => sum + entry.withdrawalAmount, 0);
    this.balance = this.totalDebt - this.totalCredit;
  }



  createModel: BankDetailModel = new BankDetailModel();
  updateModel: BankDetailModel = new BankDetailModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private activated: ActivatedRoute,
    private renderer: Renderer2,
    private date: DatePipe
  ) {
    this.activated.params.subscribe(res => {
      this.bankId = res["id"];
      //this.startDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
     // this.endDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
      this.createModel.date = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
      this.createModel.bankId = this.bankId;

      this.getAll();
      this.getAllBanks();
      this.getAllCashRegisters();
      this.getAllCustomers();
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.tListModal) {
        const modalElement = this.tListModal.nativeElement;
        this.renderer.listen(modalElement, 'shown.bs.modal', () => {
          this.openTListModal();
        });
      }
    });
  }


  getAllDates() {
    this.http.post<BankModel>("BankDetails/GetAll",
      {bankId: this.bankId, startDate: this.startDate, endDate: this.endDate}, (res) => {
        this.bank = res;
      });
  }

  getAll() {
    this.http.post<BankModel>("BankDetails/GetAll", {bankId: this.bankId}, (res) => {
      this.bank = res;
      this.openTListModal();
    });
  }

  getAllBanks() {
    this.http.post<BankModel[]>("Banks/GetAll", {}, (res) => {
      this.banks = res.filter(p => p.id != this.bankId);
    });
  }

  getAllCashRegisters() {
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll", {}, (res) => {
      this.cashRegisters = res;
    });
  }

  getAllCustomers() {
    this.http.post<CustomerModel[]>("Customers/GetAll", {}, (res) => {
      this.customers = res;
    });
  }

  create(form: NgForm) {
    if (form.valid) {
      this.createModel.amount = +this.createModel.amount;
      this.createModel.oppositeAmount = +this.createModel.oppositeAmount;

      if (this.createModel.recordType == 0) {
        this.createModel.oppositeBankId = null;
        this.createModel.oppositeCashRegisterId = null;
        this.createModel.oppositeCustomerId = null;
      } else if (this.createModel.recordType == 1) {
        this.createModel.oppositeCashRegisterId = null;
        this.createModel.oppositeCustomerId = null;
      } else if (this.createModel.recordType == 2) {
        this.createModel.oppositeBankId = null;
        this.createModel.oppositeCustomerId = null;
      } else if (this.createModel.recordType == 3) {
        this.createModel.oppositeBankId = null;
        this.createModel.oppositeCashRegisterId = null;
      }


      if (this.createModel.oppositeAmount === 0) this.createModel.oppositeAmount = this.createModel.amount;

      this.http.post<string>("BankDetails/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new BankDetailModel();
        this.createModel.date = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
        this.createModel.bankId = this.bankId;

        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  deleteById(model: BankDetailModel) {
    this.swal.callSwal("Banka hareketini Sil?", `${model.date} tarihteki ${model.description} açıklamalı hareketi silmek istiyor musunuz?`, () => {
      this.http.post<string>("BankDetails/DeleteBankDetailById", {id: model.id}, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }

  get(model: BankDetailModel) {
    this.updateModel = {...model};
    this.updateModel.amount = this.updateModel.depositAmount + this.updateModel.withdrawalAmount;
    this.updateModel.type = this.updateModel.depositAmount > 0 ? 0 : 1;
  }

  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("BankDetails/Update", this.updateModel, (res) => {
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

    // "Banka-" ile başlayan ve benzersiz numarayı içeren bir string oluştur
    this.createModel.processNumber = 'Banka-' + uniqueNumber;
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
    const dataToExport = this.calculateRunningBalance(this.bank.details).map((data, index) => {
      return {
        '#': index + 1,
        'Tarih': data.date,
        'İşlem Numarası': data.processNumber,
        'Açıklama': data.description,
        'Giriş': data.depositAmount,
        'Çıkış': data.withdrawalAmount,
        'Bakiye': data.balance,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Banka Hareketleri');
    XLSX.writeFile(wb, 'Banka Hareketleri.xlsx');
  }

  exportToExcelTFormat() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]); // Boş bir worksheet oluştur

    // Borç ve Alacak başlıklarını ekle
    ws['A1'] = { t: 's', v: 'BORÇ', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
    ws['F1'] = { t: 's', v: 'ALACAK', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };

    // Yatay çizgi için hücreleri birleştir
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // BORÇ başlığı
      { s: { r: 0, c: 5 }, e: { r: 0, c: 9 } }, // ALACAK başlığı
    ];

    // Borç verilerini ekle
    XLSX.utils.sheet_add_json(ws, this.debtEntries.map((data, index) => ({
      '#': index + 1,
      'Tarih': data.date,
      'İşlem Numarası': data.processNumber,
      'Açıklama': data.description,
      'Tutar': data.depositAmount
    })), {
      header: ['#', 'Tarih', 'İşlem Numarası', 'Açıklama', 'Tutar'],
      skipHeader: false,
      origin: 'A2'
    });

    // Alacak verilerini ekle (yan tarafa)
    XLSX.utils.sheet_add_json(ws, this.creditEntries.map((data, index) => ({
      '#': index + 1,
      'Tarih': data.date,
      'İşlem Numarası': data.processNumber,
      'Açıklama': data.description,
      'Tutar': data.withdrawalAmount
    })), {
      header: ['#', 'Tarih', 'İşlem Numarası', 'Açıklama', 'Tutar'],
      skipHeader: false,
      origin: 'F2'
    });

    // Bakiye hesaplama ve ekleme
    const totalDebtRow = this.debtEntries.length + 2;
    const totalCreditRow = this.creditEntries.length + 2;
    const balanceRow = Math.max(totalDebtRow, totalCreditRow) + 2;

    // Hücre stilini ayarla (varsayılan siyah yazı rengi)
    const cellStyle = { font: { color: { rgb: "000000" } } };

    // Bakiye
    ws[`C${balanceRow}`] = {
      t: 's',
      v: this.balance >= 0 ? 'Borç Bakiye:' : 'Alacak Bakiye:',
      s: cellStyle
    };
    ws[`D${balanceRow}`] = { t: 'n', v: Math.abs(this.balance), z: '#,##0.00', s: cellStyle };

    // Çizgi ekleme: Yatay çizgi
    for (let col = 0; col <= 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ c: col, r: 1 });
      ws[cellAddress] = ws[cellAddress] || {};
      ws[cellAddress].s = { ...ws[cellAddress].s, border: { bottom: { style: "thin", color: { rgb: "000000" } } } };
    }

    // Çizgi ekleme: Dikey çizgi
    const maxRow = Math.max(this.debtEntries.length, this.creditEntries.length) + 2;
    for (let row = 2; row <= maxRow; row++) {
      const cellAddress = XLSX.utils.encode_cell({ c: 4, r: row });
      ws[cellAddress] = ws[cellAddress] || {};
      ws[cellAddress].s = { ...ws[cellAddress].s, border: { right: { style: "thin", color: { rgb: "000000" } } } };
    }

    // Konsola verileri yazdır
    console.log('Excel Data:', ws);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'T Ekstre');
    XLSX.writeFile(wb, 'T Ekstre.xlsx');
  }


  async loadDejaVuSansFont(doc: jsPDF) {
    try {
      const fontUrl = 'assets/fonts/DejaVuSans.ttf';
      const response = await fetch(fontUrl);

      if (!response.ok) {
        throw new Error(`Failed to load font from ${fontUrl}: ${response.statusText}`);
      }

      const font = await response.arrayBuffer();
      const fontUint8Array = new Uint8Array(font);

      const base64String = uint8ArrayToBase64(fontUint8Array);

      doc.addFileToVFS('DejaVuSans.ttf', base64String);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    } catch (error) {
      console.error('Error loading font:', error);
    }
  }


  async exportToPdf() {
    const doc = new jsPDF({
      orientation: 'landscape'  // Sayfa yönünü yatay yap
    });

    await this.loadDejaVuSansFont(doc);
    doc.setFont('DejaVuSans');

    const margin = 20;  // Kenar boşluğunu azaltalım
    const fontSize = 10;
    const columnWidth = (doc.internal.pageSize.width - 2 * margin) / 8; // 8 sütun varsayımı (2 tablo x 4 sütun)

    doc.setFontSize(fontSize);
// Başlık Y konumunu tablo başlangıcına daha yakın olacak şekilde ayarlayın
    const headerY = margin + 15; // Daha küçük bir değer deneyin
    doc.text('Banka Adı: ' + this.bank.name, margin, headerY - 10);
    doc.text('Borç', margin, headerY);
    doc.text('Alacak', margin + 4 * columnWidth, headerY); // Başlıkları tablo başlangıcına daha yakın konumlandır

    function formatDate(dateStr: string | Date): string {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }


    const bodyData = [];
    const maxRows = Math.max(this.debtEntries.length, this.creditEntries.length);

    for (let i = 0; i < maxRows; i++) {
      const debtEntry = this.debtEntries[i] || {};
      const creditEntry = this.creditEntries[i] || {};
      bodyData.push([
        debtEntry.date ? formatDate(debtEntry.date) : '',
        debtEntry.processNumber || '',
        debtEntry.description || '',
        debtEntry.depositAmount ? debtEntry.depositAmount.toFixed(2) : '',
        creditEntry.date ? formatDate(creditEntry.date) : '',
        creditEntry.processNumber || '',
        creditEntry.description || '',
        creditEntry.withdrawalAmount ? creditEntry.withdrawalAmount.toFixed(2) : '',
      ]);
    }

    autoTable(doc, {
      startY: headerY + 2 * fontSize + 5, // Başlıkları hesaba katmak için 2 * fontSize ekleyin
      head: [['Tarih', 'No', 'Açıklama', 'Tutar', 'Tarih', 'No', 'Açıklama', 'Tutar']],
      body: bodyData,
      theme: 'grid',  // Basit bir tablo görünümü
      columnStyles: { 0: { cellWidth: columnWidth } }, // Sütun genişliklerini eşitle
      styles: { font: 'DejaVuSans', fontSize },
    });

// **Tarih ekleme kısmı**
    const today = new Date();
    const formattedDate = formatDate(today);
    const dateTextWidth = doc.getTextWidth('Tarih: ' + formattedDate);
    const dateX = doc.internal.pageSize.width - margin - dateTextWidth; // Sağa yaslama
    doc.text('Tarih: ' + formattedDate, dateX, headerY - 10);


// Toplam ve bakiyeyi tablonun altına ekleyin
    const tableEndY = (doc as any).lastAutoTable.finalY;
    doc.text(`Toplam Borç: ${this.totalDebt.toFixed(2)}`, margin, tableEndY + 15);
    doc.text(`Toplam Alacak: ${this.totalCredit.toFixed(2)}`, margin + 4 * columnWidth, tableEndY + 15);
    doc.text(`Bakiye: ${this.balance.toFixed(2)}`, margin + 2 * columnWidth, tableEndY + 30); // Bakiyeyi ortaya konumla

    doc.save(`${this.bank.name}_T_List.pdf`);
  }

}

