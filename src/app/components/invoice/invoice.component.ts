import {Component, ElementRef, ViewChild} from '@angular/core';
import { NgForm} from "@angular/forms";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {InvoicePipe} from "../../pipes/invoice.pipe";
import {InvoiceModel} from "../../models/invoice.model";
import {CustomerModel} from "../../models/customer.model";
import {ProductModel} from "../../models/product.model";
import {InvoiceDetailModel} from "../../models/invoice-detail.model";
import {DatePipe} from "@angular/common";
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// `uint8ArrayToBase64` fonksiyonunu burada tanımlayın
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}


@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    SharedModule,
    InvoicePipe
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
  providers: [DatePipe]
})
export class InvoiceComponent {
  invoices: InvoiceModel[] = [];
  customers: CustomerModel[] = [];
  products: ProductModel[] = [];
  search:string = "";
  invoiceNumberGenerated = false;
  p: number = 1;


  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:InvoiceModel = new InvoiceModel();
  updateModel:InvoiceModel = new InvoiceModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private date: DatePipe
  ){
    this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCustomers();
    this.getAllProducts();
  }

  getAll(){
    this.http.post<InvoiceModel[]>("Invoices/GetAll",{},(res)=> {
      this.invoices = res;
    });
  }

  getAllCustomers(){
    this.http.post<CustomerModel[]>("Customers/GetAll",{},(res)=> {
      this.customers = res;
    });
  }

  getAllProducts(){
    this.http.post<ProductModel[]>("Products/GetAll",{},(res)=> {
      this.products = res;
    });
  }

  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("Invoices/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new InvoiceModel();
        this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  deleteById(model: InvoiceModel){
    this.swal.callSwal("Faturayı Sil?",`${model.invoiceNumber} numaralı faturayı silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Invoices/DeleteInvoiceById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: InvoiceModel){
    this.updateModel = {...model};
    this.updateModel.typeValue = this.updateModel.type.value;
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Invoices/DeleteInvoiceById",{id: this.updateModel.id},(res)=> {
        this.http.post<string>("Invoices/Create",this.updateModel,(res)=> {
          this.swal.callToast(res, "info");
          this.updateModalCloseBtn?.nativeElement.click();
          this.getAll();
        });
      });
    }
  }

  addDetail(){
    const detail: InvoiceDetailModel = {
      price: this.createModel.price,
      quantity: this.createModel.quantity,
      productId: this.createModel.productId,
      id: "",
      invoiceId: "",
      product: this.products.find(p=> p.id == this.createModel.productId) ?? new ProductModel(),
      discountRate: this.createModel.discountRate, // "discountRate": 0,
      taxRate: this.createModel.taxRate, // "taxRate": 0,
      brutTotal: this.createModel.price * this.createModel.quantity,
      discountTotal: (this.createModel.price * this.createModel.quantity) * this.createModel.discountRate / 100,
      netTotal: this.createModel.price * this.createModel.quantity - ((this.createModel.price * this.createModel.quantity) * this.createModel.discountRate / 100),
      taxTotal: ((this.createModel.price * this.createModel.quantity - ((this.createModel.price * this.createModel.quantity) * this.createModel.discountRate / 100)) * this.createModel.taxRate / 100),
      grandTotal: (this.createModel.price * this.createModel.quantity - ((this.createModel.price * this.createModel.quantity) * this.createModel.discountRate / 100)) + ((this.createModel.price * this.createModel.quantity - ((this.createModel.price * this.createModel.quantity) * this.createModel.discountRate / 100)) * this.createModel.taxRate / 100)

    };

    this.createModel.details.push(detail);

    this.createModel.productId = "";
    this.createModel.quantity = 0;
    this.createModel.price = 0;
    this.createModel.discountRate = 0;
    this.createModel.taxRate = 0;

  }

  removeDetailItem(index: number){
    this.createModel.details.splice(index,1);
  }

  addDetailForUpdate(){
    const detail: InvoiceDetailModel = {
      price: this.updateModel.price,
      quantity: this.updateModel.quantity,
      productId: this.updateModel.productId,
      id: "",
      invoiceId: "",
      product: this.products.find(p=> p.id == this.updateModel.productId) ?? new ProductModel(),
      discountRate: this.updateModel.discountRate, // "discountRate": 0,
      taxRate: this.updateModel.taxRate, // "taxRate": 0,
      brutTotal: this.updateModel.price * this.updateModel.quantity,
      discountTotal: (this.updateModel.price * this.updateModel.quantity) * this.updateModel.discountRate / 100,
      netTotal: this.updateModel.price * this.updateModel.quantity - ((this.updateModel.price * this.updateModel.quantity) * this.updateModel.discountRate / 100),
      taxTotal: ((this.updateModel.price * this.updateModel.quantity - ((this.updateModel.price * this.updateModel.quantity) * this.updateModel.discountRate / 100)) * this.updateModel.taxRate / 100),
      grandTotal: (this.updateModel.price * this.updateModel.quantity - ((this.updateModel.price * this.updateModel.quantity) * this.updateModel.discountRate / 100)) + ((this.updateModel.price * this.updateModel.quantity - ((this.updateModel.price * this.updateModel.quantity) * this.updateModel.discountRate / 100)) * this.updateModel.taxRate / 100)

    };

    this.updateModel.details.push(detail);

    this.updateModel.productId = "";
    this.updateModel.quantity = 0;
    this.updateModel.price = 0;
    this.updateModel.discountRate = 0;
    this.updateModel.taxRate = 0;
  }

  removeDetailItemForUpdate(index: number){
    this.updateModel.details.splice(index,1);
  }

  calculateBrutTotal(): number {
    let brutTotal = 0;
    for (const detail of this.createModel.details) {
      brutTotal += detail.quantity * detail.price;
    }
    return brutTotal;
  }

  calculateTotalDiscount(): number {
    let totalDiscount = 0;
    for (const detail of this.createModel.details) {
      totalDiscount += (detail.quantity * detail.price * detail.discountRate) / 100;
    }
    return totalDiscount;
  }

  calculateNetTotal(): number {
    return this.calculateBrutTotal() - this.calculateTotalDiscount();
  }

  calculateTotalTax(): number {
    let totalTax = 0;
    for (const detail of this.createModel.details) {
      totalTax += ((detail.quantity * detail.price - ((detail.quantity * detail.price) * detail.discountRate / 100)) * detail.taxRate / 100);
    }
    return totalTax;
  }

  calculateGrandTotal(): number {
    return this.calculateNetTotal() + this.calculateTotalTax();
  }


  calculateBrutTotalForUpdate(): number {
    let brutTotal = 0;
    for (const detail of this.updateModel.details) {
      brutTotal += detail.quantity * detail.price;
    }
    return brutTotal;
  }

  calculateTotalDiscountForUpdate(): number {
    let totalDiscount = 0;
    for (const detail of this.updateModel.details) {
      totalDiscount += (detail.quantity * detail.price * detail.discountRate) / 100;
    }
    return totalDiscount;
  }

  calculateNetTotalForUpdate(): number {
    return this.calculateBrutTotalForUpdate() - this.calculateTotalDiscountForUpdate();
  }

  calculateTotalTaxForUpdate(): number {
    let totalTax = 0;
    for (const detail of this.updateModel.details) {
      totalTax += ((detail.quantity * detail.price - ((detail.quantity * detail.price) * detail.discountRate / 100)) * detail.taxRate / 100);
    }
    return totalTax;
  }

  calculateGrandTotalForUpdate(): number {
    return this.calculateNetTotalForUpdate() + this.calculateTotalTaxForUpdate();
  }

  onTypeValueChange() {
    this.invoiceNumberGenerated = false; // Fatura tipi değiştiğinde fatura numarasının yeniden oluşturulması gerektiğini belirt
    if (this.createModel.typeValue && this.createModel.productId) {
      this.updateProductDetails();
    }
  }

  onProductChange() {
    if (this.createModel.typeValue && this.createModel.productId) {
      this.updateProductDetails();
    }
  }

  updateProductDetails() {
    const selectedProduct = this.products.find(p => p.id === this.createModel.productId);
    if (selectedProduct) {
      const priceKey = this.createModel.typeValue == 1 ? 'purchasePrice' : 'sellingPrice';
      const discountKey = this.createModel.typeValue == 1 ? 'purchaseDiscountRate' : 'discountRate';
      this.createModel.price = selectedProduct[priceKey];
      this.createModel.taxRate = selectedProduct.taxRate;
      this.createModel.discountRate = selectedProduct[discountKey];
    }
  }

  onTypeValueChangeUp() {
    if (this.updateModel.typeValue && this.updateModel.productId) {
      this.updateProductDetailsUp();
    }
  }

  onProductChangeUp() {
    if (this.updateModel.typeValue && this.updateModel.productId) {
      this.updateProductDetailsUp();
    }
  }

  updateProductDetailsUp() {
    const selectedProduct = this.products.find(p => p.id === this.updateModel.productId);
    if (selectedProduct) {
      const priceKey = this.updateModel.typeValue == 1 ? 'purchasePrice' : 'sellingPrice';
      const discountKey = this.updateModel.typeValue == 1 ? 'purchaseDiscountRate' : 'discountRate';
      this.updateModel.price = selectedProduct[priceKey];
      this.updateModel.taxRate = selectedProduct.taxRate;
      this.updateModel.discountRate = selectedProduct[discountKey];
    }
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

  generateInvoiceNumber() {
    let prefix = '';
    if (this.createModel.typeValue == 1) {
      prefix = 'AF-';
    } else if (this.createModel.typeValue == 2) {
      prefix = 'SF-';
    }
    this.createModel.invoiceNumber = prefix + this.generateUniqueNumber(10);
    this.invoiceNumberGenerated = true; // Fatura numarası oluşturulduğunu belirt
  }

  onTypeValueChanges() {
    this.invoiceNumberGenerated = false; // Fatura tipi değiştiğinde fatura numarasının yeniden oluşturulması gerektiğini belirt
    if (this.createModel.typeValue && this.createModel.productId) {
      this.updateProductDetails();
    }
  }
  onButtonClick() {
    this.onTypeValueChanges();
  }
  exportToExcel() {
    const dataToExport = (this.invoices).map((data, index) => {
      return {
        '#': index + 1,
        'Fatura Tipi': data.type.name,
        'Cari': data.customer.name,
        'Fatura Numarası': data.invoiceNumber,
        'Tarih': data.date,
        'Tutar': data.amount,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fatura Listesi');
    XLSX.writeFile(wb, 'Faturalar.xlsx');
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
    doc.text('Fatura', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fatura No: ${this.createModel.invoiceNumber}`, 20, 30);
    doc.text(`Tarih: ${formattedDate}`, 20, 40);
    doc.text(`Fatura Tipi: ${this.createModel.typeValue == 1 ? 'Alış' : 'Satış'}`, 20, 50);
    doc.text(`Cari Hesap: ${this.customers.find(c => c.id === this.createModel.customerId)?.name || ''}`, 20, 60);

    // Details Table
    autoTable(doc, {
      startY: 70,
      head: [['#', 'Stok ismi', 'Miktar', 'Fiyat', 'Isk. %', 'Kdv %', 'Brüt Tutar']],
      body: this.createModel.details.map((d, i) => [
        i + 1,
        d.product.name,
        d.quantity,
        this.formatCurrency(d.price),
        d.discountRate,
        d.taxRate,
        this.formatCurrency(d.quantity * d.price),
      ]),
      styles: { font: 'DejaVuSans', halign: 'left', fontSize: 10 },
      columnStyles: { 0: { halign: 'center' } }
    });

    // Footer (Totals)
    const tableEndY = (doc as any).lastAutoTable.finalY;
    const rightMargin = 30;
    doc.setFontSize(10);
    doc.text(`Brüt Tutar: ${this.formatCurrency(this.calculateBrutTotal())}`, pageWidth - 80 + rightMargin, tableEndY + 20, { align: 'right' });
    doc.text(`İskonto Tutar: ${this.formatCurrency(this.calculateTotalDiscount())}`, pageWidth - 80 + rightMargin, tableEndY + 30, { align: 'right' });
    doc.text(`Net Tutar: ${this.formatCurrency(this.calculateNetTotal())}`, pageWidth - 80 + rightMargin, tableEndY + 40, { align: 'right' });
    doc.text(`Kdv: ${this.formatCurrency(this.calculateTotalTax())}`, pageWidth - 80 + rightMargin, tableEndY + 50, { align: 'right' });
    doc.text(`Genel Tutar: ${this.formatCurrency(this.calculateGrandTotal())}`, pageWidth - 80 + rightMargin, tableEndY + 60, { align: 'right' });

    doc.save('Fatura.pdf');
  }


  formatCurrency(value: number): string {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
}





