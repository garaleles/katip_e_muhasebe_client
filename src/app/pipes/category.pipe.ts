import { Pipe, PipeTransform } from '@angular/core';
import {CategoryModel} from "../models/category.model";

@Pipe({
  name: 'category',
  standalone: true
})
export class CategoryPipe implements PipeTransform {

  transform(value: CategoryModel[], search: string): CategoryModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.description.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
