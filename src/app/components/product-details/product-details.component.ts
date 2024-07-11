import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {HttpService} from "../../services/http.service";
import {ActivatedRoute} from "@angular/router";
import {ProductModel} from "../../models/product.model";
import {SharedModule} from "../../modules/shared.module";
import {ProductDetailPipe} from "../../pipes/product-detail.pipe";
import {ExpenseDetailPipe} from "../../pipes/expense-detail.pipe";
import * as XLSX from 'xlsx';
import {ProductDetailModel} from "../../models/product-detail.model";
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
  selector: 'app-product-details',
  standalone: true,
  imports: [SharedModule, ProductDetailPipe, ExpenseDetailPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements AfterViewInit{
  product: ProductModel = new ProductModel();
  productId: string = "";
  search:string = "";
  p: number = 1;

  pDebt: number = 1;  // Borç tablosu için sayfa numarası
  pCredit: number = 1; // Alacak tablosu için sayfa numarası
  debtEntries: ProductDetailModel[] = [];
  creditEntries: ProductDetailModel[] = [];
  filteredEntries: ProductDetailModel[] = [];
  totalDebt: number = 0;
  totalCredit: number = 0;
  balance: number = 0;

  @ViewChild('tListModal') tListModal!: ElementRef;

  openTListModal() {
    // Modal açıldığında çalışacak kod
    this.filterEntries();
    this.calculateTotals();
  }

  filterEntries() {
    this.debtEntries = this.product.details.filter(entry => entry.withdrawal > 0); // Çıkışlar (satışlar)
    this.creditEntries = this.product.details.filter(entry => entry.deposit > 0);  // Girişler (alışlar)
  }

  calculateTotals() {
    this.totalDebt = this.debtEntries.reduce((sum, entry) => sum + entry.withdrawal, 0); // Çıkışların toplamı
    this.totalCredit = this.creditEntries.reduce((sum, entry) => sum + entry.deposit, 0); // Girişlerin toplamı
    this.balance = this.totalCredit - this.totalDebt; // Kalan stok = Girişler - Çıkışlar
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
  constructor(
    private http: HttpService,
    private renderer: Renderer2,
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
       this.openTListModal();
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

  exportToExcelTFormat() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]); // Boş bir worksheet oluştur

    // Borç ve Alacak başlıklarını ekle
    ws['A1'] = { t: 's', v: 'Giriş', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
    ws['F1'] = { t: 's', v: 'Çıkış', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };

    // Yatay çizgi için hücreleri birleştir
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // BORÇ başlığı
      { s: { r: 0, c: 5 }, e: { r: 0, c: 9 } }, // ALACAK başlığı
    ];

    // Stok Girişi (Alış) verilerini SOLA ekle
    XLSX.utils.sheet_add_json(ws, this.creditEntries.map((data, index) => ({
      '#': index + 1,
      'Tarih': data.date,
      'İşlem Numarası': data.invoiceNumber,
      'Açıklama': data.description,
      'Miktar': data.deposit, // Alış miktarı
    /*  'Birim Fiyat': data.grandTotal / data.deposit, // Birim fiyat hesaplaması (KDV dahil)
      'Toplam Tutar': data.grandTotal // Toplam tutar (KDV dahil)*/
    })), {
      header: ['#', 'Tarih', 'İşlem Numarası', 'Açıklama', 'Miktar'],
      skipHeader: false,
      origin: 'A2'
    });

    // Stok Çıkışı (Satış) verilerini SAĞA ekle
    XLSX.utils.sheet_add_json(ws, this.debtEntries.map((data, index) => ({
      '#': index + 1,
      'Tarih': data.date,
      'İşlem Numarası': data.invoiceNumber,
      'Açıklama': data.description,
      'Miktar': data.withdrawal, // Satış miktarı
     /* 'Birim Fiyat': data.grandTotal / data.withdrawal, // Birim fiyat hesaplaması (KDV dahil)
      'Toplam Tutar': data.grandTotal // Toplam tutar (KDV dahil)*/
    })), {
      header: ['#', 'Tarih', 'İşlem Numarası', 'Açıklama', 'Miktar'],
      skipHeader: false,
      origin: 'H2' // Sağ taraftan başla (H sütunu)
    });

    // Bakiye hesaplama ve ekleme
    let currentStock = 0;
    this.product.details.forEach(detail => {
      currentStock += detail.deposit - detail.withdrawal;
      detail.balance = currentStock;
    });

    const totalDebtRow = this.creditEntries.length + 2; // Alışların son satırı
    const totalCreditRow = this.debtEntries.length + 2; // Satışların son satırı
    const balanceRow = Math.max(totalDebtRow, totalCreditRow) + 2;

    // Bakiye
    ws[`E${balanceRow}`] = { t: 's', v: 'Kalan Stok:' };
    ws[`F${balanceRow}`] = { t: 'n', v: currentStock }; // Son kalan stok miktarını yazdır

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
    doc.text('Ürün Adı: ' + this.product.name, margin, headerY - 10);
    doc.text('Giriş', margin, headerY);
    doc.text('Çıkış', margin + 4 * columnWidth, headerY); // Başlıkları tablo başlangıcına daha yakın konumlandır

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
        creditEntry.date ? formatDate(creditEntry.date) : '',
        creditEntry.invoiceNumber || '',
        creditEntry.description || '',
        creditEntry.deposit ? creditEntry.deposit.toFixed(2) : '',

        debtEntry.date ? formatDate(debtEntry.date) : '',
        debtEntry.invoiceNumber || '',
        debtEntry.description || '',
        debtEntry.withdrawal ? debtEntry.withdrawal.toFixed(2) : '',

      ]);
    }

    autoTable(doc, {
      startY: headerY + 2 * fontSize + 5, // Başlıkları hesaba katmak için 2 * fontSize ekleyin
      head: [['Tarih', 'No', 'Açıklama', 'Miktar', 'Tarih', 'No', 'Açıklama', 'Miktar']],
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
    doc.text(`Toplam Giriş: ${this.totalCredit.toFixed(2)}`, margin, tableEndY + 15);
    doc.text(`Toplam Çıkış: ${this.totalDebt.toFixed(2)}`, margin + 4 * columnWidth, tableEndY + 15);
    doc.text(`Bakiye: ${this.balance.toFixed(2)}`, margin + 2 * columnWidth, tableEndY + 30); // Bakiyeyi ortaya konumla

    doc.save(`${this.product.name}_T_List.pdf`);
  }
}
