import { Pipe, PipeTransform } from '@angular/core';
import {UnitModel} from "../models/unit.model";

@Pipe({
  name: 'unit',
  standalone: true
})
export class UnitPipe implements PipeTransform {

  transform(value: UnitModel[], search: string): UnitModel[] {
    if (!search) return value;

    return value.filter(p =>
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}
