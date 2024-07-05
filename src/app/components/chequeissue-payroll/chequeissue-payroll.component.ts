import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Check} from "../../models/check.model";
import {BankModel} from "../../models/bank.model";
import {CashRegisterModel} from "../../models/cash-register.model";
import {CustomerModel} from "../../models/customer.model";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {ChequeissuePayrollPipe} from "../../pipes/chequeissue-payroll.pipe";
import {DatePipe} from "@angular/common";
import {CheckStatusEnumDescriptions, ChequeissuePayrollModel} from "../../models/chequeissue-payroll.model";
import {NgForm} from "@angular/forms";
import {ChequeissuePayrollDetailModel} from "../../models/chequeissue-payroll-detail.model";
import { CheckStatusEnum } from '../../models/chequeissue-payroll.model';
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
  selector: 'app-chequeissue-payroll',
  standalone: true,
  imports: [
    SharedModule,
    ChequeissuePayrollPipe
  ],
  providers: [DatePipe],
  templateUrl: './chequeissue-payroll.component.html',
  styleUrl: './chequeissue-payroll.component.css'
})
export class ChequeissuePayrollComponent implements OnInit{
  CheckStatusEnum = CheckStatusEnum;
  payrollId: string = '';
  chequeissuePayrolls: ChequeissuePayrollModel[] = [];
  checks: Check[] = [];
  banks: BankModel[] = [];
  cashRegisters: CashRegisterModel[] = [];
  customers: CustomerModel[] = [];
  customer: CustomerModel = new CustomerModel();
  search: string = "";
  payrollNumberGenerated = false;
  p: number = 1;
  isCreating: boolean = true;
  isBankReadonly: boolean = true;
  isCashRegisterReadonly: boolean = true;
  isCustomerReadonly: boolean = true;



  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: ChequeissuePayrollModel = new ChequeissuePayrollModel();
  updateModel: ChequeissuePayrollModel = new ChequeissuePayrollModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private date: DatePipe
  ) {
    this.createModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCustomers();
    this.getAllCheckPortfolios();
    this.getAllBanks();
    this.getAllCashRegisters();
    if (this.isCreating) { // Sadece createModel ile ilgili bir işlem yapılıyorsa bordro numarasını oluştur
      this.generatePayrollNumber();

      this.loadPayrollDetails(this.payrollId);
    }

    // Başlangıç değerlerini boş string olarak atayın
    this.createModel.customerId = '';
    this.createModel.bankId = '';
    this.createModel.cashRegisterId = '';
    this.createModel.checkId = '';
  }

  getAll() {
    this.http.post<ChequeissuePayrollModel[]>("ChequeissuePayroll/GetAll", {}, (res) => {
      this.chequeissuePayrolls = res;
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
      //console.log("Gönderilen Model:", JSON.stringify(this.createModel, null, 2)); // Gönderilen verileri kontrol edin
      this.createModel.checkCount = this.calculateCheckCount();
      this.createModel.payrollAmount = this.calculateTotalAmount();
      this.createModel.status = this.createModel.status;
      this.createModel.cashRegisterId = this.createModel.cashRegisterId || null;
      this.createModel.bankId = this.createModel.bankId || null;
      this.createModel.bankDetailId = this.createModel.bankDetailId || '';
      this.createModel.cashRegisterDetailId = this.createModel.cashRegisterDetailId || '';
      const averageMaturityDate = this.calculateAverageMaturity().toISOString().split('T')[0];

      const payload = {
        date: this.createModel.date,
        payrollNumber: this.createModel.payrollNumber,
        customerId: this.createModel.customerId,
        payrollAmount: this.createModel.payrollAmount,
        description: this.createModel.description,
        checkCount: this.createModel.checkCount,
        averageMaturityDate: averageMaturityDate,
        status: this.createModel.status,
        cashRegisterId: this.createModel.cashRegisterId,
        bankId: this.createModel.bankId,
        bankDetailId: this.createModel.bankDetailId,
        cashRegisterDetailId: this.createModel.cashRegisterDetailId,
        details: this.createModel.details.map(detail => ({
          id: detail.id,
          chequeissuePayrollId: detail.chequeissuePayrollId,
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
        }))
      };

      console.log("Gönderilen Payload:", JSON.stringify(payload, null, 2));

      // Status kontrolü
      if (this.createModel.status >= CheckStatusEnum.Paid && this.createModel.status <= CheckStatusEnum.InPortfolio) {
        this.http.post<string>("ChequeissuePayroll/Create", payload, (res) => {
          this.swal.callToast(res);
          this.createModel = new ChequeissuePayrollModel();
          this.createModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
          this.createModalCloseBtn?.nativeElement.click();
          this.getAll();
        });
      } else {
        this.swal.callToast("Geçersiz işlem tipi seçildi.", "error");
      }
    }
  }


  deleteById(model: ChequeissuePayrollModel) {
    this.swal.callSwal("Çek Çıkış Bordrosunu Sil?", `${model.id} numaralı çek çıkış bordrosunu silmek istiyor musunuz?`, () => {
      this.http.post<string>("ChequeissuePayroll/DeleteChequeissuePayrollById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }

  get(model: ChequeissuePayrollModel) {
    this.isCreating = false; // Durum değişkenini güncelleme olarak ayarlayın
    this.updateModel = { ...model };
    this.updateModel.averageMaturityDate = model.averageMaturityDate; // Veritabanından alınan ortalama vade değerini atayın
    this.loadPayrollDetails(this.payrollId);
  }

  update(form: NgForm) {
    if (form.valid) {
      this.updateModel.status = this.updateModel.status;
      this.updateModel.checkCount = this.updateCalculateCheckCount();
      this.updateModel.cashRegisterId = this.updateModel.cashRegisterId || null;
      this.updateModel.bankId = this.updateModel.bankId || null;
      this.updateModel.bankDetailId = this.updateModel.bankDetailId || '';
      this.updateModel.cashRegisterDetailId = this.updateModel.cashRegisterDetailId || '';
      this.updateModel.payrollAmount = this.updateCalculateTotalAmount();
      this.updateCalculateAverageMaturity(); // Ortalama vade tarihini güncelleyin
      const payload = {
        date: this.updateModel.date, // Corrected here
        payrollNumber: this.updateModel.payrollNumber,
        customerId: this.updateModel.customerId,
        payrollAmount: this.updateModel.payrollAmount,
        description: this.updateModel.description,
        checkCount: this.updateModel.checkCount,
        averageMaturityDate: this.updateModel.averageMaturityDate,
        status: this.updateModel.status,
        cashRegisterId: this.updateModel.cashRegisterId,
        bankId: this.updateModel.bankId,
        bankDetailId: this.updateModel.bankDetailId,
        cashRegisterDetailId: this.updateModel.cashRegisterDetailId,
        details: this.updateModel.details.map(detail => ({
          id: detail.id,
          chequeissuePayrollId: detail.chequeissuePayrollId,
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
        }))
      };

      console.log("Gönderilen Update Payload:", JSON.stringify(payload, null, 2));

      // Status kontrolü
      if (this.updateModel.status >= CheckStatusEnum.Paid && this.updateModel.status <= CheckStatusEnum.InPortfolio) {
        this.http.post<string>("ChequeissuePayroll/DeleteChequeissuePayrollById", { id: this.updateModel.id }, (res) => {
        this.http.post<string>("ChequeissuePayroll/Create", payload, (res) => {
          this.swal.callToast(res);
          this.updateModel = new ChequeissuePayrollModel();
          this.updateModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
          this.updateModalCloseBtn?.nativeElement.click();
          this.getAll();
        });
      });
      } else {
        this.swal.callToast("Geçersiz işlem tipi seçildi.", "error");
      }
    }

  }





  addDetail() {
    const detail: ChequeissuePayrollDetailModel = {
      id: this.generateGuid(),
      chequeissuePayrollId: this.generateGuid(),
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

  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    prefix = 'ÇB-';
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
    const detail: ChequeissuePayrollDetailModel = {
      id: this.updateModel.id,
      chequeissuePayrollId: this.updateModel.id,
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
    };

    this.updateModel.details.push(detail);

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

    // Ortalama vade tarihini güncelle
    this.updateCalculateAverageMaturity();
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
      !this.createModel.dueDate ||
      !this.createModel.status ||
      !(this.createModel.customerId || this.createModel.bankId || this.createModel.cashRegisterId);
  }
  updateSelects() {
    console.log('Güncel createModel.status:', this.createModel.status);
    switch (this.createModel.status) {
      case CheckStatusEnum.Paid:  // Tahsil Edildi (1)
        this.isCashRegisterReadonly = false;
        this.isBankReadonly = true;
        this.isCustomerReadonly = true;
        this.createModel.customerId = this.customers[0]?.id || '';
        break;

      case CheckStatusEnum.Unpaid: // Karşılıksız (2)
      case CheckStatusEnum.Endorsed: // Ciro (3)
      case CheckStatusEnum.Returned: // İade (4)
        this.isCashRegisterReadonly = true;
        this.isBankReadonly = true;
        this.isCustomerReadonly = false;
        if (!this.createModel.customerId) {
          this.createModel.customerId = this.customers[0]?.id || null; // Varsayılan olarak ilk müşteriyi seç veya null yap
        }
        break;


      case CheckStatusEnum.Banked: // Bankaya Tahsile Verildi (5)
      case CheckStatusEnum.SendToBankForCollateral: // Bankaya Teminata Verildi (6)
        this.isCashRegisterReadonly = true;
        this.isBankReadonly = false;
        this.isCustomerReadonly = true;
        this.createModel.customerId = null;  // Müşteri ID'sini null yap
        if (!this.createModel.bankId) {
          this.createModel.bankId = this.banks[0]?.id || ""; // Varsayılan olarak ilk bankayı seç veya null yap
        }
        break;

      case CheckStatusEnum.InPortfolio: // Portföyde (7)
      default:
        this.isCashRegisterReadonly = true;
        this.isBankReadonly = true;
        this.isCustomerReadonly = true;
        this.createModel.customerId = null; // Müşteri ID'sini null yap
        break;
    }
  }



  updateCheckDetails(checkId: string) {
    const selectedCheck = this.checks.find(check => check.id === checkId);

    if (selectedCheck) {
      this.createModel.bankName = selectedCheck.bankName;
      this.createModel.branchName = selectedCheck.branchName;
      this.createModel.accountNumber = selectedCheck.accountNumber;
      this.createModel.checkNumber = selectedCheck.checkNumber;
      this.createModel.amount = selectedCheck.amount;
      this.createModel.debtor = selectedCheck.debtor;
      this.createModel.creditor = selectedCheck.creditor;
      this.createModel.endorser = selectedCheck.endorser;
      this.createModel.dueDate = selectedCheck.dueDate;
    } }

  resetForm() {
    // createModel'i sıfırla
    this.createModel = new ChequeissuePayrollModel();
    this.createModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";


    // Diğer özellikleri sıfırla
    this.isBankReadonly = true;
    this.isCashRegisterReadonly = true;
    this.isCustomerReadonly = true;
    this.payrollNumberGenerated = false;

    // Gerekirse yeni bir bordro numarası oluştur
    this.generatePayrollNumber();

    // Modal içerisindeki tüm input, select ve textarea elementlerini seç
    const allInputs = document.querySelectorAll('#createModal input, #createModal select, #createModal textarea');

    // Seçilen elementlerin değerlerini sıfırla
    allInputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.value = ''; // Input elementlerinin değerini boşalt
        input.name = ''; // Input elementlerinin name özelliğini boşalt
      } else if (input instanceof HTMLSelectElement) {
        input.selectedIndex = -1; // Select elementlerinin seçili değerini kaldır (boş yap)
        input.name = ''; // Select elementlerinin name özelliğini boşalt
      } else if (input instanceof HTMLTextAreaElement) {
        input.value = ''; // Textarea elementlerinin değerini boşalt
        input.name = ''; // Textarea elementlerinin name özelliğini boşalt
      }
    });


  }
  // Getter method
  get checkStatusEnumValues() {
    return Object.values(CheckStatusEnum).filter(value => typeof value === 'number') as CheckStatusEnum[];
  }


  loadPayrollDetails(id: string): void {
    this.http.getPayrollDetails(id).subscribe((payroll: ChequeissuePayrollModel) => {
      this.updateModel = payroll;
      console.log('API Response:', payroll); // API'den gelen veriyi konsola yazdır
    });
  }

  updateCheckDetailsUp(checkId: string) {
    const selectedCheck = this.checks.find(check => check.id === checkId);

    if (selectedCheck) {
      this.updateModel.bankName = selectedCheck.bankName;
      this.updateModel.branchName = selectedCheck.branchName;
      this.updateModel.accountNumber = selectedCheck.accountNumber;
      this.updateModel.checkNumber = selectedCheck.checkNumber;
      this.updateModel.amount = selectedCheck.amount;
      this.updateModel.debtor = selectedCheck.debtor;
      this.updateModel.creditor = selectedCheck.creditor;
      this.updateModel.endorser = selectedCheck.endorser;
      this.updateModel.dueDate = selectedCheck.dueDate;
    } }
  isFormIncompleteUp() {
    return !this.updateModel.date ||
      !this.updateModel.bankName ||
      !this.updateModel.branchName ||
      !this.updateModel.accountNumber ||
      !this.updateModel.checkNumber ||
      !this.updateModel.amount ||
      !this.updateModel.debtor ||
      !this.updateModel.creditor ||
      !this.updateModel.endorser ||
      !this.updateModel.dueDate ||
      !this.updateModel.status ||
      !(this.updateModel.customerId || this.updateModel.bankId || this.updateModel.cashRegisterId);
  }

  exportToExcel() {
    const dataToExport = (this.chequeissuePayrolls).map((data, index) => {
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
    XLSX.utils.book_append_sheet(wb, ws, 'Çek Çıkış Bordrosu');
    XLSX.writeFile(wb, 'ÇıkanCekler.xlsx');
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
    doc.text('Çek Çıkış Bordrosu', pageWidth / 2, 20, { align: 'center' });

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
    doc.text('Çek Çıkış Bordrosu', pageWidth / 2, 20, { align: 'center' });

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

  protected readonly CheckStatusEnumDescriptions = CheckStatusEnumDescriptions;
}
