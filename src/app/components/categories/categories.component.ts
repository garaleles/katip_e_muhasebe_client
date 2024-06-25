import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {CategoryPipe} from "../../pipes/category.pipe";
import {CategoryModel} from "../../models/category.model";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-categories',
  standalone: true,
    imports: [
      SharedModule,
      CategoryPipe,
      RouterLink

    ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  categories: CategoryModel[] = [];
  search: string = "";

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  createModel: CategoryModel = new CategoryModel();
  updateModel: CategoryModel = new CategoryModel();
  constructor(
    private http: HttpService,
    private swal: SwalService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }
  getAll() {
    this.http.post<CategoryModel[]>("Categories/GetAll", {}, (res) => {
      this.categories = res;
    });
  }
  create(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Categories/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new CategoryModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  deleteById(model: CategoryModel) {
    this.swal.callSwal("Kategoriyi Sil?", `${model.name} kategorisini silmek istiyor musunuz?`, () => {
      this.http.post<string>("Categories/DeleteCategoryById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }
  get(model: CategoryModel) {
    this.updateModel = { ...model };
  }
  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Categories/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

}
