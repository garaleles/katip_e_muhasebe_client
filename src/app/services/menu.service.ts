// menu.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuModel } from '../menu'

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private expandedMenuSubject = new BehaviorSubject<MenuModel | null>(null);
  expandedMenu$ = this.expandedMenuSubject.asObservable();

  toggleMenu(menu: MenuModel) {
    if (this.expandedMenuSubject.value === menu) {
      this.expandedMenuSubject.next(null); // Aynı menü tekrar tıklanırsa kapat
    } else {
      this.expandedMenuSubject.next(menu);
    }
  }

  isMenuExpanded(menu: MenuModel): boolean {
    return this.expandedMenuSubject.value === menu;
  }
}
