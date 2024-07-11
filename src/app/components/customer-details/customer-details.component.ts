import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { CustomerDetailPipe } from '../../pipes/customer-detail.pipe';
import { CustomerModel } from '../../models/customer.model';
import { HttpService } from '../../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { ExpenseDetailPipe } from "../../pipes/expense-detail.pipe";
import * as XLSX from 'xlsx';
import { CustomerDetailModel } from "../../models/customer-detail.model";
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
  selector: 'app-customer-details',
  standalone: true,
  imports: [SharedModule, CustomerDetailPipe, ExpenseDetailPipe],
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent {
  customer: CustomerModel = new CustomerModel();
  customerId: string = "";
  search: string = "";
  balance: number = 0;
  p: number = 1;

  pDebt: number = 1;  // Borç tablosu için sayfa numarası
  pCredit: number = 1; // Alacak tablosu için sayfa numarası
  debtEntries: CustomerDetailModel[] = [];
  creditEntries: CustomerDetailModel[] = [];
  filteredEntries: CustomerDetailModel[] = [];
  totalDebt: number = 0;
  totalCredit: number = 0;

  @ViewChild('tListModal') tListModal!: ElementRef;

  openTListModal() {
    // Modal açıldığında çalışacak kod
    this.filterEntries();
    this.calculateTotals();
  }

  filterEntries() {
    this.debtEntries = this.customer.details.filter(entry => entry.depositAmount > 0);
    this.creditEntries = this.customer.details.filter(entry => entry.withdrawalAmount > 0);
  }

  calculateTotals() {
    this.totalDebt = this.debtEntries.reduce((sum, entry) => sum + entry.depositAmount, 0);
    this.totalCredit = this.creditEntries.reduce((sum, entry) => sum + entry.withdrawalAmount, 0);
    this.balance = this.totalDebt - this.totalCredit;
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
  ) {
    this.activated.params.subscribe(res => {
      this.customerId = res["id"];
      this.getAll();
    })
  }

  getAll() {
    this.http.post<CustomerModel>("CustomerDetails/GetAll",
      { customerId: this.customerId }, (res) => {
        this.customer = res;
        this.openTListModal();
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
    //console.log('Excel Data:', ws);

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
    doc.text('Cari Adı: ' + this.customer.name, margin, headerY - 10);
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

    doc.save(`${this.customer.name}_T_List.pdf`);
  }



}
