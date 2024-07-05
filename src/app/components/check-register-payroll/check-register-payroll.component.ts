import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { NgForm } from "@angular/forms";
import { HttpService } from "../../services/http.service";
import { SwalService } from "../../services/swal.service";
import { DatePipe } from "@angular/common";
import {SharedModule} from "../../modules/shared.module";
import {CheckRegisterPayrollPipe} from "../../pipes/check-register-payroll.pipe";
import {CompanyCheckAccount} from "../../models/company-check-account.model";
import {CustomerModel} from "../../models/customer.model";
import {CheckRegisterPayrollDetail} from "../../models/check-register-payroll-detail.model";
import {Check} from "../../models/check.model";
import {BankModel} from "../../models/bank.model";
import {CashRegisterModel} from "../../models/cash-register.model";
import {CheckRegisterPayroll} from "../../models/check-register-payroll.model";
import * as XLSX from "xlsx";
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
  selector: 'app-check-register-payroll',
  standalone: true,
  templateUrl: './check-register-payroll.component.html',
  styleUrls: ['./check-register-payroll.component.css'],
  imports: [
    SharedModule,
    CheckRegisterPayrollPipe,
  ],
  providers: [DatePipe]
})
export class CheckRegisterPayrollComponent implements OnInit{
  checkRegisterPayrolls: CheckRegisterPayroll[] = [];
  companyCheckAccounts: CompanyCheckAccount[] = [];
  checks: Check[] = [];
  banks: BankModel[] = [];
  cashRegisters: CashRegisterModel[] = [];
  customers: CustomerModel[] = [];
  customer: CustomerModel = new CustomerModel();
  search: string = "";
  payrollNumberGenerated = false;
  p: number = 1;
  isCreating: boolean = true; // Durum değişkeni



  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: CheckRegisterPayroll = new CheckRegisterPayroll();
  updateModel: CheckRegisterPayroll = new CheckRegisterPayroll();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private date: DatePipe
  ) {
    this.createModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCompanyCheckAccounts();
    this.getAllCustomers();
    this.getAllCheckPortfolios();
    this.getAllBanks();
    this.getAllCashRegisters();
    if (this.isCreating) { // Sadece createModel ile ilgili bir işlem yapılıyorsa bordro numarasını oluştur
      this.generatePayrollNumber();
    }
  }

  getAll() {
    this.http.post<CheckRegisterPayroll[]>("CheckRegisterPayroll/GetAll", {}, (res) => {
      this.checkRegisterPayrolls = res;
    });
  }
  getAllCompanyCheckAccounts() {
    this.http.post<CompanyCheckAccount[]>("CompanyCheckAccounts/GetAll", {}, (res) => {
      this.companyCheckAccounts = res;
    });
  }

  getAllCustomers() {
    this.http.post<CustomerModel[]>("Customers/GetAll", {}, (res) => {
      this.customers = res;
    });
  }
  getAllCheckPortfolios() {
    this.http.post<Check[]>("Checks/GetAllPortfolios", {}, (res) => {
      this.checks = res;
    });
  }
  getAllBanks() {
    this.http.post<BankModel[]>("Banks/GetAll", {}, (res) => {
      this.banks = res;
    });
  }

  getAllCashRegisters() {
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll", {}, (res) => {
      this.cashRegisters = res;
    });
  }

  create(form: NgForm) {
    if (form.valid) {
      console.log("Gönderilen Model:", JSON.stringify(this.createModel, null, 2)); // Gönderilen verileri kontrol edin
      this.createModel.checkCount = this.calculateCheckCount();
      this.createModel.payrollAmount = this.calculateTotalAmount();
      const averageMaturityDate = this.calculateAverageMaturity().toISOString().split('T')[0];

      const payload = {
        date: this.createModel.date,
        payrollNumber: this.createModel.payrollNumber,
        customerId: this.createModel.customerId,
        payrollAmount: this.createModel.payrollAmount,
        description: this.createModel.description,
        checkCount: this.createModel.checkCount,
        averageMaturityDate: averageMaturityDate,
        details: this.createModel.details.map(detail => ({
          id: detail.id || this.generateGuid(),
          checkRegisterPayrollId: this.generateGuid(),
          checkNumber: detail.checkNumber,
          bankName: detail.bankName,
          branchName: detail.branchName,
          accountNumber: detail.accountNumber,
          dueDate: detail.dueDate,
          amount: detail.amount,
          description: detail.description,
          debtor: detail.debtor,
          creditor: detail.creditor,
          endorser: detail.endorser,
          updatedDate: new Date().toISOString()
        }))
      };

      this.http.post<string>("CheckRegisterPayroll/Create", payload, (res) => {
        this.swal.callToast(res);
        this.createModel = new CheckRegisterPayroll();
        this.createModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }


  deleteById(model: CheckRegisterPayroll) {
    this.swal.callSwal("Çek Giriş Bordrosunu Sil?", `${model.id} numaralı çek giriş bordrosunu silmek istiyor musunuz?`, () => {
      this.http.post<string>("CheckRegisterPayroll/DeleteCheckRegisterPayrollById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }

  get(model: CheckRegisterPayroll) {
    this.isCreating = false; // Durum değişkenini güncelleme olarak ayarlayın
    this.updateModel = { ...model };
    this.updateModel.averageMaturityDate = model.averageMaturityDate; // Veritabanından alınan ortalama vade değerini atayın
  }

  update(form: NgForm) {
    if (form.valid) {
     // console.log("Gönderilen Model:", JSON.stringify(this.updateModel, null, 2)); // Gönderilen verileri kontrol edin

      this.updateModel.checkCount = this.updateCalculateCheckCount();
      this.updateModel.payrollAmount = this.updateCalculateTotalAmount();
      this.updateCalculateAverageMaturity(); // Ortalama vade tarihini güncelleyin

      const payload = {
        date: this.updateModel.date,
        payrollNumber: this.updateModel.payrollNumber,
        customerId: this.updateModel.customerId,
        payrollAmount: this.updateModel.payrollAmount,
        description: this.updateModel.description,
        checkCount: this.updateModel.checkCount,
        averageMaturityDate: this.updateModel.averageMaturityDate, // Güncel ortalama vade tarihini payload'a ekleyin
        details: this.updateModel.details.map(detail => ({
          id: detail.id || this.generateGuid(),
          checkRegisterPayrollId: this.generateGuid(),
          checkNumber: detail.checkNumber,
          bankName: detail.bankName,
          branchName: detail.branchName,
          accountNumber: detail.accountNumber,
          dueDate: detail.dueDate,
          amount: detail.amount,
          description: detail.description,
          debtor: detail.debtor,
          creditor: detail.creditor,
          endorser: detail.endorser,
          updatedDate: new Date().toISOString()
        }))
      };

      this.http.post<string>("CheckRegisterPayroll/DeleteCheckRegisterPayrollById", { id: this.updateModel.id }, (res) => {
        this.http.post<string>("CheckRegisterPayroll/Create", payload, (res) => {
          this.swal.callToast(res, "info");
          this.updateModalCloseBtn?.nativeElement.click();
          this.getAll();
        });
      });
    }
  }





  addDetail() {
    const detail: CheckRegisterPayrollDetail = {
      id: this.generateGuid(),
      checkRegisterPayrollId: this.createModel.id, // payrollId'yi doğru şekilde atayın
      checkNumber: this.createModel.checkNumber,
      bankName: this.createModel.bankName,
      branchName: this.createModel.branchName,
      accountNumber: this.createModel.accountNumber,
      dueDate: this.createModel.dueDate,
      amount: this.createModel.amount,
      description: this.createModel.description,
      debtor: this.createModel.debtor,
      creditor: this.createModel.creditor,
      endorser: this.createModel.endorser,
      updatedDate: new Date().toISOString()

    };

    this.createModel.details.push(detail);

    // Input alanlarını temizle
    this.createModel.checkNumber = '';
    this.createModel.bankName = '';
    this.createModel.branchName = '';
    this.createModel.accountNumber = '';
    this.createModel.dueDate = '';
    this.createModel.amount = 0;
    this.createModel.debtor = '';
    this.createModel.creditor = '';
    this.createModel.endorser = '';
  }


// GUID oluşturma fonksiyonu
  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }



  removeDetailItem(index: number) {
    this.createModel.details?.splice(index, 1);
  }

  calculateCheckCount(): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.createModel.details) {
      return 0;
    }

    // Aksi halde, details array'inin uzunluğunu döndür.
    return this.createModel.details.length;
  }


  calculateTotalAmount(): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.createModel.details) {
      return 0;
    }

    // Aksi halde, details array'indeki tüm amount değerlerinin toplamını döndür.
    return this.createModel.details.reduce((total, detail) => total + detail.amount, 0);
  }


  calculateAverageMaturity(): Date {
    if (!this.createModel.details) {
      return new Date();
    }

    const totalAmount = this.calculateTotalAmount();
    if (totalAmount === 0) {
      return new Date();
    }

    const totalDays = this.createModel.details.reduce((total, detail) => {
      const dueDate = new Date(detail.dueDate);
      const days = dueDate.getTime() / (1000 * 60 * 60 * 24);
      return total + days * detail.amount;
    }, 0);

    const averageDays = totalDays / totalAmount;
    const averageDate = new Date(averageDays * 1000 * 60 * 60 * 24);
    return averageDate;
  }

  generateUniqueNumber(length: number): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generatePayrollNumber() {
    let prefix = '';
      prefix = 'GB-';
    this.createModel.payrollNumber = prefix + this.generateUniqueNumber(10);
    this.payrollNumberGenerated = true;
  }

  openPayroll(): void {
    this.isCreating = true; // Durum değişkenini oluşturuluyor olarak ayarlayın
    // Bordro açma işlemleri...
    this.generatePayrollNumber(); // Bordro numarasını otomatik olarak oluştur
  }



  updateCalculateCheckCount(): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.updateModel.details) {
      return 0;
    }

    // Aksi halde, details array'inin uzunluğunu döndür.
    return this.updateModel.details.length;
  }


  updateCalculateTotalAmount(): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.updateModel.details) {
      return 0;
    }

    // Aksi halde, details array'indeki tüm amount değerlerinin toplamını döndür.
    return this.updateModel.details.reduce((total, detail) => total + detail.amount, 0);
  }


  updateCalculateAverageMaturity(): Date {
    if (!this.updateModel.details || this.updateCalculateTotalAmount() === 0) {
      return new Date(); // Eğer details array tanımlı değilse veya toplam tutar 0 ise, şimdiki tarihi döndür
    }

    const totalAmount = this.updateCalculateTotalAmount();
    const totalDays = this.updateModel.details.reduce((total, detail) => {
      const dueDate = new Date(detail.dueDate);
      const days = dueDate.getTime() / (1000 * 60 * 60 * 24);
      return total + days * detail.amount;
    }, 0);

    const averageDays = totalDays / totalAmount;
    const averageDate = new Date(averageDays * 1000 * 60 * 60 * 24);

    return averageDate; // Ortalama vade tarihini Date olarak döndür
  }



  removeDetailItemUp(index: number) {
    this.updateModel.details?.splice(index, 1);
    this.updateCalculateAverageMaturity(); // Ortalama vade tarihini güncelleyin
  }

  addDetailUp() {
    const detail: CheckRegisterPayrollDetail = {
      id: this.updateModel.id,
      checkRegisterPayrollId: this.updateModel.id, // payrollId'yi doğru şekilde atayın
      checkNumber: this.updateModel.checkNumber,
      bankName: this.updateModel.bankName,
      branchName: this.updateModel.branchName,
      accountNumber: this.updateModel.accountNumber,
      dueDate: this.updateModel.dueDate,
      amount: this.updateModel.amount,
      description: this.updateModel.description,
      debtor: this.updateModel.debtor,
      creditor: this.updateModel.creditor,
      endorser: this.updateModel.endorser,
      updatedDate: new Date().toISOString()
    };

    this.updateModel.details.push(detail);
    this.updateCalculateAverageMaturity(); // Ortalama vade tarihini güncelleyin
    // Input alanlarını temizle
    this.updateModel.checkNumber = '';
    this.updateModel.bankName = '';
    this.updateModel.branchName = '';
    this.updateModel.accountNumber = '';
    this.updateModel.dueDate = '';
    this.updateModel.amount = 0;
    this.updateModel.debtor = '';
    this.updateModel.creditor = '';
    this.updateModel.endorser = '';
  }



  isFormIncomplete() {
     return !this.createModel.date ||
    !this.createModel.bankName ||
    !this.createModel.branchName ||
    !this.createModel.accountNumber ||
    !this.createModel.checkNumber ||
    !this.createModel.amount ||
    !this.createModel.debtor ||
    !this.createModel.creditor ||
    !this.createModel.endorser ||
    !this.createModel.dueDate;
  }


  exportToExcel() {
    const dataToExport = (this.checkRegisterPayrolls).map((data, index) => {
      return {
        '#': index + 1,
        'Bordro No:': data.payrollNumber,
        'Cari': data.customer?.name,
        'Tarih': data.date,
        'Toplam Çek Adedi': data.checkCount,
        'Ortalama Vade Tarihi': data.averageMaturityDate,
        'Bordro Tutarı': data.payrollAmount,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Çek Giriş Bordrosu');
    XLSX.writeFile(wb, 'GelenCekler.xlsx');
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
    const doc = new jsPDF();
    await this.loadDejaVuSansFont(doc);

    const pageWidth = doc.internal.pageSize.width;
    const formattedDate = new Date(this.createModel.date).toLocaleDateString('tr-TR');

    // DejaVu Sans fontunu kullan
    doc.setFont('DejaVuSans');

    // Header
    doc.setFontSize(16);
    doc.text('Çek Giriş Bordrosu', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Bordro No: ${this.createModel.payrollNumber}`, 20, 30);
    doc.text(`Tarih: ${formattedDate}`, 20, 40);
    doc.text(`Cari Hesap: ${this.customers.find(c => c.id === this.createModel.customerId)?.name || ''}`, 20, 60);

    // Details Table
    autoTable(doc, {
      startY: 70,
      head: [['#', 'Çek No', 'Banka', 'Şube', 'Hesap No', 'Vade','Borçlusu', 'Tutar']],
      body: this.createModel.details.map((d, i) => [
        i + 1,
        d.checkNumber,
        d.bankName,
        d.branchName,
        d.accountNumber,
        new Date(d.dueDate).toLocaleDateString('tr-TR'),
        d.debtor,
        this.formatCurrency(d.amount)
      ]),
      styles: { font: 'DejaVuSans', halign: 'left', fontSize: 10 },
      columnStyles: { 0: { halign: 'center' } }
    });

    // Footer (Totals)
    const tableEndY = (doc as any).lastAutoTable.finalY;
    const rightMargin = 30;
    doc.setFontSize(10);
    doc.text(`Çek Sayısı: ${this.calculateCheckCount()}`, pageWidth - 80 + rightMargin, tableEndY + 10, { align: 'right' });
    doc.text(`Ortalama Vade: ${new Date(this.calculateAverageMaturity()).toLocaleDateString('tr-TR')}`, pageWidth - 80 + rightMargin, tableEndY + 20, { align: 'right' });
    doc.text(`Bordro Tutarı: ${this.formatCurrency(this.calculateTotalAmount())}`, pageWidth - 80 + rightMargin, tableEndY + 30, { align: 'right' });

    doc.save('GCekBordro.pdf');
  }


  formatCurrency(value: number): string {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }


  async exportToPdfUp() {
    const doc = new jsPDF();
    await this.loadDejaVuSansFont(doc);

    const pageWidth = doc.internal.pageSize.width;
    const formattedDate = new Date(this.updateModel.date).toLocaleDateString('tr-TR');

    // DejaVu Sans fontunu kullan
    doc.setFont('DejaVuSans');

    // Header
    doc.setFontSize(16);
    doc.text('Çek Giriş Bordrosu', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Bordro No: ${this.updateModel.payrollNumber}`, 20, 30);
    doc.text(`Tarih: ${formattedDate}`, 20, 40);
    doc.text(`Cari Hesap: ${this.customers.find(c => c.id === this.updateModel.customerId)?.name || ''}`, 20, 60);

    // Details Table
    autoTable(doc, {
      startY: 70,
      head: [['#', 'Çek No', 'Banka', 'Şube', 'Hesap No', 'Vade','Borçlusu', 'Tutar']],
      body: this.updateModel.details.map((d, i) => [
        i + 1,
        d.checkNumber,
        d.bankName,
        d.branchName,
        d.accountNumber,
        new Date(d.dueDate).toLocaleDateString('tr-TR'),
        d.debtor,
        this.formatCurrency(d.amount)
      ]),
      styles: { font: 'DejaVuSans', halign: 'left', fontSize: 10 },
      columnStyles: { 0: { halign: 'center' } }
    });

    // Footer (Totals)
    const tableEndY = (doc as any).lastAutoTable.finalY;
    const rightMargin = 30;
    doc.setFontSize(10);
    doc.text(`Çek Sayısı: ${this.updateCalculateCheckCount()}`, pageWidth - 80 + rightMargin, tableEndY + 10, { align: 'right' });
    doc.text(`Ortalama Vade: ${new Date(this.updateCalculateAverageMaturity()).toLocaleDateString('tr-TR')}`, pageWidth - 80 + rightMargin, tableEndY + 20, { align: 'right' });
    doc.text(`Bordro Tutarı: ${this.formatCurrency(this.updateCalculateTotalAmount())}`, pageWidth - 80 + rightMargin, tableEndY + 30, { align: 'right' });

    doc.save('GCekBordro.pdf');
  }

}








