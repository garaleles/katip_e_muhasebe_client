import {Component, ChangeDetectorRef, OnInit} from '@angular/core';
import {MenuModel, Menus} from '../../../menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuPipe } from '../../../pipes/menu.pipe';
import { AuthService } from '../../../services/auth.service';
import {CommonModule, NgClass} from "@angular/common";
import {MenuService} from "../../../services/menu.service";

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, MenuPipe, NgClass, CommonModule],
  templateUrl: './main-sidebar.component.html',
  styleUrls: ['./main-sidebar.component.css']
})
export class MainSidebarComponent implements OnInit {
  search = '';
  menus = Menus;

  constructor(public auth: AuthService, public menuService: MenuService) {
    if (!this.auth.user.isAdmin) {
      this.menus = this.menus.filter(x => !x.showThisMenuJustAdmin);
    }
  }

  ngOnInit() {
    this.initializeMenuStates();
  }

  initializeMenuStates() {
    this.menus.forEach(menu => {
      menu.isExpanded = this.menuService.isMenuExpanded(menu); // Servisten kontrol et
      if (menu.subMenus) {
        menu.subMenus.forEach(subMenu => subMenu.isExpanded = false);
      }
    });
  }

  toggleMenu(menu: MenuModel) {
    this.menuService.toggleMenu(menu);
  }

  trackByMenu(index: number, menu: MenuModel): string {
    return menu.name;
  }

  trackBySubMenu(index: number, subMenu: MenuModel): string {
    return subMenu.name;
  }
}
