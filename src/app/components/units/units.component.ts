import {Component, ElementRef, ViewChild} from '@angular/core';
import {BlankComponent} from "../blank/blank.component";
import {CategoryPipe} from "../../pipes/category.pipe";
import {FormValidateDirective} from "form-validate-angular";
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {SectionComponent} from "../section/section.component";
import {UnitModel} from "../../models/unit.model";
import {HttpService} from "../../services/http.service";
import {SwalService} from "../../services/swal.service";
import {SharedModule} from "../../modules/shared.module";
import {RouterLink} from "@angular/router";
import {UnitPipe} from "../../pipes/unit.pipe";

@Component({
  selector: 'app-units',
  standalone: true,
    imports: [
      SharedModule,
      UnitPipe,
      RouterLink
    ],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css'
})
export class UnitsComponent {
  units: UnitModel[] = [];
  search: string = "";

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  createModel: UnitModel = new UnitModel();
  updateModel: UnitModel = new UnitModel();
  constructor(
    private http: HttpService,
    private swal: SwalService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }
  getAll() {
    this.http.post<UnitModel[]>("units/GetAll", {}, (res) => {
      this.units = res;
    });
  }
  create(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Units/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new UnitModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }
  deleteById(model: UnitModel) {
    this.swal.callSwal("Birimi Sil?", `${model.name} birimini silmek istiyor musunuz?`, () => {
      this.http.post<string>("Units/DeleteUnitById", { id: model.id }, (res) => {
        this.getAll();
        this.swal.callToast(res, "info");
      });
    })
  }
  get(model: UnitModel) {
    this.updateModel = { ...model };
  }
  update(form: NgForm) {
    if (form.valid) {
      this.http.post<string>("Units/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

}
