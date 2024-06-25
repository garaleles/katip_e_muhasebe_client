import { Pipe, PipeTransform } from '@angular/core';
import {CustomerModel} from "../models/customer.model";

@Pipe({
  name: 'customer',
  standalone: true
})
export class CustomerPipe implements PipeTransform {

  transform(value: CustomerModel[], search:string): CustomerModel[] {
    if(!search) return value;

    return value.filter(p=>
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.city.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.district.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.fullAddress.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.taxNumber.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.taxOffice.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.phone.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}

