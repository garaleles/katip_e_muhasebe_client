export class DashboardExpensesModel {
  data: Array<{
    name: string;
    description: string;
    currencyType: {
      name: string;
      value: number;
    };
    withdrawalAmount: number;
    details: null;
    id: string;
    isDeleted: boolean;
  }> = [];  // Initialize data with an empty array
  errorMessages: string | null = null;
  isSuccessful: boolean = false;
}
