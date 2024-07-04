import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {CompanyCheckAccount} from "../../models/company-check-account.model";
import {CustomerModel} from "../../models/customer.model";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {DatePipe} from "@angular/common";
import {NgForm} from "@angular/forms";
import {SharedModule} from "../../modules/shared.module";
import {CheckRegisterPayrollPipe} from "../../pipes/check-register-payroll.pipe";
import {CompanyCheckissuePayrollPipe} from "../../pipes/company-checkissue-payroll.pipe";
import {CompanyCheckissuePayrollModel} from "../../models/company-checkissue-payroll.model";


@Component({
  selector: 'app-company-checkissue-payroll',
  standalone: true,
  imports: [SharedModule,
    CompanyCheckissuePayrollPipe, CheckRegisterPayrollPipe,
  ],
  providers: [DatePipe],
  templateUrl: './company-checkissue-payroll.component.html',
  styleUrl: './company-checkissue-payroll.component.css'
})
export class CompanyCheckissuePayrollComponent {
  companyCheckissuePayrolls: CompanyCheckissuePayrollModel[] = [];
  companyCheckAccounts: CompanyCheckAccount[] = [];
  customers: CustomerModel[] = [];
  customer: CustomerModel = new CustomerModel();
  search: string = "";
  payrollNumberGenerated = false;
  p: number = 1;
  isCreating: boolean = true; // Durum değişkeni



  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: CompanyCheckissuePayrollModel = new CompanyCheckissuePayrollModel();
  updateModel: CompanyCheckissuePayrollModel = new CompanyCheckissuePayrollModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.createModel.date = this.datePipe.transform(new Date(), "yyyy-MM-dd") ?? "";
  }

  transformDate(dateString: string | Date | undefined): string {
    if (dateString instanceof Date) { // Eğer tarih nesnesi ise doğrudan formatla
      return this.datePipe.transform(dateString, 'yyyy-MM-dd') || '';
    } else if (typeof dateString === 'string') { // String ise Date nesnesine dönüştür
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
    } else {
      return ''; // Geçersiz değer için boş döndür
    }
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCompanyCheckAccounts();
    this.getAllCustomers();
    if (this.isCreating) { // Sadece createModel ile ilgili bir işlem yapılıyorsa bordro numarasını oluştur
      this.generatePayrollNumber();
    }
  }

  getAll() {
    this.http.post<CompanyCheckissuePayrollModel[]>("CompanyCheckissuePayrolls/GetAll", {}, (res) => {
      this.companyCheckissuePayrolls = res;
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



  create(form: NgForm) {
    if (form.valid) {
      console.log("Gönderilen Model:", JSON.stringify(this.createModel, null, 2));
      this.createModel.checkCount = this.calculateCheckCount(this.createModel.details); // details argümanı eklendi
      this.createModel.payrollAmount = this.calculateTotalAmount(this.createModel.details); // details argümanı eklendi
      const averageMaturityDate = this.calculateAverageMaturity(this.createModel.details).toISOString().split('T')[0]; // details argümanı eklendi

      const payload = {
        date: this.createModel.date,
        payrollNumber: this.createModel.payrollNumber,
        customerId: this.createModel.customerId,
        payrollAmount: this.createModel.payrollAmount,
        description: this.createModel.description,
        checkCount: this.createModel.checkCount,
        averageMaturityDate: averageMaturityDate,
        CheckAccounts: this.createModel.details.map(detail => ({
          checkNumber: detail.checkNumber,
          accountNumber: detail.accountNumber,
          bankName: detail.bankName,
          branchName: detail.branchName,
          amount: detail.amount,
          dueDate: detail.dueDate,
          customerId: this.createModel.customerId // Müşteri ID'si eklendi
        }))
      };


      this.http.post<string>("CompanyCheckissuePayrolls/Create", payload, (res) => {
        this.swal.callToast(res);
        this.createModel = new CompanyCheckissuePayrollModel();
        this.createModel.date = this.datePipe.transform(new Date(), "yyyy-MM-dd") ?? "";
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }


  deleteById(model: CompanyCheckissuePayrollModel) {
    this.swal.callSwal("Firma Çek Çıkış Bordrosunu Sil?", `${model.id} numaralı çek giriş bordrosunu silmek istiyor musunuz?`, () => {
      this.http.post<string>("CompanyCheckissuePayrolls/DeleteCompanyCheckissuePayrollById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }

  get(model: CompanyCheckissuePayrollModel) {
    this.isCreating = false;
    this.updateModel = { ...model };
    this.updateModel.averageMaturityDate = model.averageMaturityDate;

    // Detayları çekmek için ayrı bir HTTP isteği gönder
    this.http.post<CompanyCheckAccount[]>("CompanyCheckAccounts/GetById", { id: model.id }, (res) => {
      this.updateModel.details = res; // Detayları güncelleme modeline aktar
    });
  }



  update(form: NgForm) {
    if (form.valid) {
      // console.log("Gönderilen Model:", JSON.stringify(this.updateModel, null, 2)); // Gönderilen verileri kontrol edin

      this.updateModel.checkCount = this.updateModel.details.length;
      this.updateModel.payrollAmount = this.calculateTotalAmount(this.updateModel.details);
      this.updateModel.averageMaturityDate = this.calculateAverageMaturity(this.updateModel.details).toISOString().split('T')[0];

      const updatedChecks = this.updateModel.details.filter(detail => detail.id);
      const newCheckAccounts = this.updateModel.details.filter(detail => !detail.id);
      const deletedCheckIds = this.companyCheckAccounts
        .filter(check =>
          check.companyCheckissuePayrollId === this.updateModel.id &&
          !updatedChecks.find(uc => uc.id === check.id)
        )
        .map(check => check.id);

      const payload = {
        id: this.updateModel.id,
        date: this.updateModel.date,
        payrollNumber: this.updateModel.payrollNumber,
        customerId: this.updateModel.customerId,
        payrollAmount: this.updateModel.payrollAmount,
        description: this.updateModel.description,
        checkCount: this.updateModel.checkCount,
        averageMaturityDate: this.updateModel.averageMaturityDate, // Güncel ortalama vade tarihini payload'a ekleyin
        CheckAccounts: [...updatedChecks, ...newCheckAccounts].map(detail => ({
          id: detail.id || undefined, // İlişkili veritabanı kaydı yoksa id'yi undefined yap
          checkNumber: detail.checkNumber,
          bankName: detail.bankName,
          branchName: detail.branchName,
          accountNumber: detail.accountNumber,
          dueDate: detail.dueDate,
          amount: detail.amount,
          customerId: this.updateModel.customerId
        }))
      };

      this.http.post<string>("CompanyCheckissuePayrolls/Update", payload, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }




  addDetail() {
    const detail: CompanyCheckAccount = {
      id: this.generateGuid(),
      checkNumber: this.createModel.checkNumber,
      bankName: this.createModel.bankName,
      branchName: this.createModel.branchName,
      accountNumber: this.createModel.accountNumber,
      dueDate: this.createModel.dueDate,
      amount: this.createModel.amount,
      customerId: this.createModel.customerId,
      customer: this.customers.find(c => c.id === this.createModel.customerId) || new CustomerModel()
    };


    this.createModel.details.push(detail);

    // Input alanlarını temizle
    this.createModel.checkNumber = '';
    this.createModel.bankName = '';
    this.createModel.branchName = '';
    this.createModel.accountNumber = '';
    this.createModel.dueDate = '';
    this.createModel.amount = 0;
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

  calculateCheckCount(details: CompanyCheckAccount[]): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.createModel.details) {
      return 0;
    }

    // Aksi halde, details array'inin uzunluğunu döndür.
    return this.createModel.details.length;
  }


  calculateTotalAmount(details: CompanyCheckAccount[]): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.createModel.details) {
      return 0;
    }

    // Aksi halde, details array'indeki tüm amount değerlerinin toplamını döndür.
    return this.createModel.details.reduce((total, detail) => total + detail.amount, 0);
  }


  calculateAverageMaturity(details: CompanyCheckAccount[]): Date {
    if (!details || details.length === 0) {
      return new Date(); // Detaylar boşsa bugünün tarihini döndür
    }

    const totalAmount = this.calculateTotalAmount(details); // details argümanını kullanarak toplam tutarı hesapla
    if (totalAmount === 0) {
      return new Date(); // Toplam tutar sıfırsa bugünün tarihini döndür
    }

    const totalDays = details.reduce((total, detail) => {
      // Tarih formatını düzeltme (varsayılan format: yyyy-MM-dd)
      const dueDateParts = detail.dueDate.split('-');
      const dueDate = new Date(
        parseInt(dueDateParts[0], 10), // 10 tabanında parseInt
        parseInt(dueDateParts[1], 10) - 1, // Ay 0'dan başladığı için 1 çıkar
        parseInt(dueDateParts[2], 10) // 10 tabanında parseInt
      );

      // Bugünün tarihi ile vade tarihi arasındaki gün farkını hesaplama
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return total + diffDays * detail.amount; // Ağırlıklı toplama
    }, 0);

    const averageDays = totalDays / totalAmount;

    // Bugünün tarihine ortalama vade gününü ekleyerek ortalama vade tarihini bulma
    const averageMaturityDate = new Date();
    averageMaturityDate.setDate(averageMaturityDate.getDate() + Math.round(averageDays)); // Yuvarlama

    return averageMaturityDate;
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
    prefix = 'FÇB-';
    this.createModel.payrollNumber = prefix + this.generateUniqueNumber(10);
    this.payrollNumberGenerated = true;
  }

  openPayroll(): void {
    this.isCreating = true; // Durum değişkenini oluşturuluyor olarak ayarlayın
    // Bordro açma işlemleri...
    this.generatePayrollNumber(); // Bordro numarasını otomatik olarak oluştur
  }



  updateCalculateCheckCount(details: CompanyCheckAccount[]): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.updateModel.details) {
      return 0;
    }

    // Aksi halde, details array'inin uzunluğunu döndür.
    return this.updateModel.details.length;
  }


  updateCalculateTotalAmount(details: CompanyCheckAccount[]): number {
    // Eğer details array tanımlı değilse, 0 döndür.
    if (!this.updateModel.details) {
      return 0;
    }

    // Aksi halde, details array'indeki tüm amount değerlerinin toplamını döndür.
    return this.updateModel.details.reduce((total, detail) => total + detail.amount, 0);
  }


  updateCalculateAverageMaturity(details: CompanyCheckAccount[]): void {
    if (!details || details.length === 0) {
      return; // Detaylar boşsa çık
    }

    const totalAmount = this.updateCalculateTotalAmount(details); // details argümanını kullan
    if (totalAmount === 0) {
      return; // Toplam tutar sıfırsa çık
    }

    const totalDays = details.reduce((total, detail) => { // details argümanını kullan
      // Tarih formatını düzeltme (varsayılan format: yyyy-MM-dd)
      const dueDateParts = detail.dueDate.split('-');
      const dueDate = new Date(
        parseInt(dueDateParts[0], 10),
        parseInt(dueDateParts[1], 10) - 1,
        parseInt(dueDateParts[2], 10)
      );

      // Bugünün tarihi ile vade tarihi arasındaki gün farkını hesaplama
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return total + diffDays * detail.amount; // Ağırlıklı toplam
    }, 0);

    const averageDays = totalDays / totalAmount;
    const averageDate = new Date();
    averageDate.setDate(averageDate.getDate() + Math.round(averageDays));

    this.updateModel.averageMaturityDate = averageDate.toISOString().split('T')[0];
  }



  removeDetailItemUp(i: number) {
    this.updateModel.details.splice(i, 1); // Çeki listeden çıkar
    this.updateCalculateAverageMaturity(this.updateModel.details); // Güncellenmiş details dizisini gönder
  }


  addDetailUp() {
    const detail: CompanyCheckAccount = {
      id: this.generateGuid(), // Yeni bir ID oluşturuyoruz
      checkNumber: this.updateModel.checkNumber,
      bankName: this.updateModel.bankName,
      branchName: this.updateModel.branchName,
      accountNumber: this.updateModel.accountNumber,
      dueDate: this.updateModel.dueDate,
      amount: this.updateModel.amount,
      customerId: this.updateModel.customerId,
      companyCheckissuePayrollId: this.updateModel.id,
      customer: this.customers.find(c => c.id === this.updateModel.customerId) || new CustomerModel()
    };

    this.updateModel.details.push(detail); // Detayı güncelleme modeline ekliyoruz
    this.updateCalculateAverageMaturity(this.updateModel.details);

    // Input alanlarını temizle
    this.updateModel.checkNumber = '';
    this.updateModel.bankName = '';
    this.updateModel.branchName = '';
    this.updateModel.accountNumber = '';
    this.updateModel.dueDate = '';
    this.updateModel.amount = 0;
  }


  isFormIncomplete() {
    return !this.createModel.date ||
      !this.createModel.bankName ||
      !this.createModel.branchName ||
      !this.createModel.accountNumber ||
      !this.createModel.checkNumber ||
      !this.createModel.amount ||
      !this.createModel.dueDate;
  }


}
