import {CategoryModel} from "./category.model";
import {UnitModel} from "./unit.model";
import {ProductDetailModel} from "./product-detail.model";

export class ProductModel{
  id: string='';
  name: string='';
  deposit: number=0;
  withdrawal: number=0;
  purchasePrice: number=0;
  sellingPrice: number=0;
  description: string='';
  discountRate: number = 0;
  purchaseDiscountRate: number = 0;
  taxRate: number = 0;
  categoryId: string='';
  unitId: string='';
  category: CategoryModel = new CategoryModel();
  unit: UnitModel = new UnitModel();
  details: ProductDetailModel[] = [];
}
