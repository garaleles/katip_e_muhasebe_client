export class CustomerDetailModel{
  id: string = "";
  type: CustomerDetailTypeEnum = new CustomerDetailTypeEnum();
  date: string = "";
  depositAmount: number = 0;
  withdrawalAmount: number = 0;
  balance: number = 0;
  description: string = "";
  bankDetailId: string | any = "";
  cacheRegisterDetailId: string  = "";
  processNumber: string | any = "";
}

export class CustomerDetailTypeEnum{
  name: string = "";
  value: number = 0;
}
