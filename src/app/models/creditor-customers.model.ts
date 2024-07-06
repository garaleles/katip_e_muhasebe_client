import {CustomerTypeEnum} from "./customer.model";

export class CreditorCustomersModel {
  id: string = "";
  name: string = "";
  type: CustomerTypeEnum = new CustomerTypeEnum();
  depositAmount: number = 0;
  withdrawalAmount: number = 0;
  balance: number = 0;
}
