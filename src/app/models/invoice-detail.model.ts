import {ProductModel} from "./product.model";

export class InvoiceDetailModel{
  id: string = "";
  invoiceId: string = "";
  productId: string = "";
  product: ProductModel = new ProductModel();
  quantity: number = 0;
  price: number = 0;
  discountRate: number = 0;
  taxRate: number = 0;
  brutTotal: number = 0;
  discountTotal: number = 0;
  netTotal: number = 0;
  taxTotal: number = 0;
  grandTotal: number = 0;
}
