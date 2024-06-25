import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {ProductPipe} from "../../pipes/product.pipe";
import {ProductModel} from "../../models/product.model";
import {CategoryModel} from "../../models/category.model";
import {UnitModel} from "../../models/unit.model";
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    SharedModule,
    ProductPipe,
    RouterLink
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: ProductModel[] = [];
  category: CategoryModel=new CategoryModel();
  categories: CategoryModel[] = [];
  categoryId: string = "";
  unit: UnitModel=new UnitModel();
  units: UnitModel[] = [];
  unitId: string = "";
  search: string = "";
  p: number = 1;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  createModel: ProductModel = new ProductModel();
  updateModel: ProductModel = new ProductModel();
  constructor(
    private http: HttpService,
    private swal: SwalService
  ) { }
  ngOnInit(): void {
    this.getAll();
    this.getAllCategories();
    this.getAllUnits();
  }
  getAll() {
    this.http.post<ProductModel[]>("Products/GetAll", {}, (res) => {
      this.products = res;
    });
  }

  getAllCategories() {
    this.http.post<CategoryModel[]>("Categories/GetAll", {}, (res) => {
      this.categories = res;
    });
  }

  getAllUnits() {
    this.http.post<UnitModel[]>("units/GetAll", {}, (res) => {
      this.units = res;
    });
  }

  create(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Products/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new ProductModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  deleteById(model: ProductModel) {
    this.swal.callSwal("Ürünü Sil?", `${model.name} ürününü silmek istiyor musunuz?`, () => {
      this.http.post<string>("Products/DeleteProductById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }
  get(model: ProductModel) {
    this.updateModel = { ...model };
  }
  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Products/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  exportToExcel() {
    const dataToExport = (this.products).map((data, index) => {
      return {
        '#': index + 1,
        'Kategori': data.category.name,
        'Ürün Adı': data.name,
        'Birim': data.unit.name,
        'Alış Fiyatı': data.purchasePrice,
        'Satış Fiyatı': data.sellingPrice,
        'G.Miktarı': data.deposit,
        'Ç.Miktarı': data.withdrawal,
        'Stok Miktarı': (data.deposit - data.withdrawal)
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Listesi');
    XLSX.writeFile(wb, 'Ürünler.xlsx');
  }

  exportTemplate() {
    const template = [
      {
        'Ürün Adı': '',
        'Kategori Id': '',
        'Birim Id': '',
        'Alış Fiyatı': '',
        'Satış Fiyatı': '',
        'Kdv Oranı': '',
        'Satış İsk. Oranı': '',
        'Alış İsk.Oranı': '',
        'Açıklama': '',

      }
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(template);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Şablonu');
    XLSX.writeFile(wb, 'urun_sablonu.xlsx');
  }

  importFile(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      this.saveDataToDatabase(data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  saveDataToDatabase(data: any[]) {
    data.forEach(item => {
      const product = new ProductModel();
      product.name = item['Ürün Adı'];
      product.categoryId = item['Kategori Id'];
      product.unitId = item['Birim Id'];
      product.purchasePrice = item['Alış Fiyatı'];
      product.sellingPrice = item['Satış Fiyatı'];
      product.taxRate = item['Kdv Oranı'];
      product.discountRate = item['Satış İsk. Oranı'];
      product.purchaseDiscountRate = item['Alış İsk.Oranı'];
      product.description = item['Açıklama'];




      this.http.post<string>("Products/Create", product, (res) => {
        this.swal.callToast(res);
        this.getAll();
      });
    });
  }

  exportUpdateTemplate() {
    const template = this.products.map(product => {
      return {
        'Ürün Id': product.id,
        'Ürün Adı': product.name,
        'Kategori Id': product.categoryId,
        'Birim Id': product.unitId,
        'Alış Fiyatı': product.purchasePrice,
        'Satış Fiyatı': product.sellingPrice,
        'Kdv Oranı': product.taxRate,
        'Satış İsk. Oranı': product.discountRate,
        'Alış İsk.Oranı': product.purchaseDiscountRate,
        'Açıklama': product.description,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(template);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Güncelleme Şablonu');
    XLSX.writeFile(wb, 'urun_guncelleme_sablonu.xlsx');
  }

  importAndUpdateFile(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      this.updateDataInDatabase(data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  updateDataInDatabase(data: any[]) {
    data.forEach(item => {
      const product = new ProductModel();
      product.id = item['Ürün Id'];
      product.name = item['Ürün Adı'];
      product.categoryId = item['Kategori Id'];
      product.unitId = item['Birim Id'];
      product.purchasePrice = item['Alış Fiyatı'];
      product.sellingPrice = item['Satış Fiyatı'];
      product.taxRate = item['Kdv Oranı'];
      product.discountRate = item['Satış İsk. Oranı'];
      product.purchaseDiscountRate = item['Alış İsk.Oranı'];
      product.description = item['Açıklama'];


      this.http.post<string>("Products/Update", product, (res) => {
        this.swal.callToast(res, "info");
        this.getAll();
      });
    });
  }
}

