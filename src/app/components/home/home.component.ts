import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from "@angular/common";
import { SectionComponent } from "../section/section.component";
import { CardComponent } from "../card/card.component";
import { BlankComponent } from "../blank/blank.component";
import { DashboardModel } from "../../models/dashboard.model";
import { HttpService } from "../../services/http.service";
import {SharedModule} from "../../modules/shared.module";
import {DashboardExpensesModel} from "../../models/dashboard-expenses.model";
import {DashboardCustomersModels} from "../../models/dashboard-customers.models";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    SectionComponent,
    CardComponent,
    BlankComponent,
    SharedModule
  ],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {
  dashboard: DashboardModel = new DashboardModel();
  dashboardExpenses: DashboardExpensesModel = new DashboardExpensesModel();
  dashboardCustomers: DashboardCustomersModels = new DashboardCustomersModels();
  totalSales: number = 0;  // New property to hold the total sales
  totalPurchases: number = 0;  // New property to hold the total purchases
  totalExpenses: number=0;  // New property to hold the total expenses
  totalDebts: number = 0;  // New property to hold the total debts
  totalWhits: number = 0;  // New property to hold the total whits
  totalStockValue: number = 0;  // New property to hold the total stock value
  totalCash: number = 0;  // New property to hold the total cash
  totalBanks: number = 0;  // New property to hold the total banks


  constructor(
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.getAll();
    this.getAllPurchases();
    this.GetAllExpenses();
    this.getAllCustomerDebts();
    this.getAllCustomersWhits();
    this.getTotalStockValue();
    this.getTotalCash();
    this.getTotalBanks();
  }

  getAll() {
    this.http.post<number>("Dashboards/GetAll", {}, (res) => {
      this.totalSales = res;  // Assign the response to totalSales
    }, () => {
      console.error("Error fetching data");
    });
  }

  getAllPurchases() {
    this.http.post<number>("Dashboards/GetAllPurchases", {}, (res) => {
      this.totalPurchases = res;  // Assign the response to totalPurchases
    }, () => {
      console.error("Error fetching data");
    });
  }
  GetAllExpenses() {
    this.http.post<Array<{name: string, description: string, currencyType: {name: string, value: number}, withdrawalAmount: number, details: null, id: string, isDeleted: boolean}>>("DashboardExpenses/GetAllExpenses", {}, (res) => {
      if (res) {
        let total = 0;  // Initialize total
        res.forEach(item => {
          if (item.withdrawalAmount) {
            total += item.withdrawalAmount;  // Add the withdrawalAmount of each item to total
          }
        });
        this.totalExpenses = total;  // Assign total to totalExpenses
      } else {
        console.error("Received response does not contain data");
      }
    }, () => {
      console.error("Error fetching data");
    });
  }
  getAllCustomerDebts() {
    this.http.post<number>("DashBoardsCustomers/GetAllDebts", {}, (res) => {
      this.totalDebts = res;  // Assign the response to totalDebts
    }, () => {
      console.error("Error fetching data");
    });
  }

  getAllCustomersWhits() {
    this.http.post<number>("DashBoardsCustomers/GetAllWhits", {}, (res) => {
      this.totalWhits = res;  // Assign the response to totalWhits
    }, () => {
      console.error("Error fetching data");
    });
  }

  getTotalStockValue() {
    this.http.post<number>("DashBoardsCustomers/GetAllStocks", {}, (res) => {
      this.totalStockValue = res;  // Assign the response to totalStockValue
    }, () => {
      console.error("Error fetching data");
    });
  }

  getTotalCash() {
    this.http.post<number>("DashBoardsCustomers/GetAllSafes", {}, (res) => {
      this.totalCash = res;  // Assign the response to totalCash
    }, () => {
      console.error("Error fetching data");
    });
  }

  getTotalBanks() {
    this.http.post<number>("DashBoardsCustomers/GetAllBanks", {}, (res) => {
      this.totalBanks = res;  // Assign the response to totalBanks
    }, () => {
      console.error("Error fetching data");
    });
  }

}

