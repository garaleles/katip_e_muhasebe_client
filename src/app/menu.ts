export class MenuModel {
  name: string = "";
  icon: string = "";
  url: string = "";
  isTitle: boolean = false;
  subMenus: MenuModel[] = [];
  showThisMenuJustAdmin: boolean = false;
}

export const Menus: MenuModel[] = [
  {
    name: "Ana Sayfa",
    icon: "fa-solid fa-home",
    url: "/",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },

  {
    name: "Admin",
    icon: "",
    url: "",
    isTitle: true,
    subMenus: [],
    showThisMenuJustAdmin: true
  },
  {
    name: "Kullanıcılar",
    icon: "fa-solid fa-users",
    url: "/users",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: true
  },
  {
    name: "Şirketler",
    icon: "fa-solid fa-city",
    url: "/companies",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: true
  },

  {
    name: "Modüller",
    icon: "",
    url: "",
    isTitle: true,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Kasalar",
    icon: "fa-solid fa-cash-register",
    url: "/cash-registers",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Bankalar",
    icon: "fa-solid fa-bank",
    url: "/banks",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Cariler",
    icon: "fa-solid fa-users",
    url: "/customers",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Ürünler",
    icon: "fa-solid fa-boxes-stacked",
    url: "/products",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Kategoriler",
    icon: "fa-solid fa-list",
    url: "/categories",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Birimler",
    icon: "fa-solid fa-unity",
    url: "/units",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Faturalar",
    icon: "fa-solid fa-file-invoice",
    url: "/invoices",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Çek Giriş Bordroları",
    icon: "fas fa-money-check-alt",
    url: "/check-register-payrolls",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Çek Çıkış Bordroları",
    icon: "fas fa-wallet",
    url: "/chequeissue-payrolls",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Firma Çekleri Bordroları",
    icon: "fas fa-wallet",
    url: "/company-checkissue-payrolls",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Giderler",
    icon: "fa-solid fa-coins",
    url: "/expenses",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Raporlar",
    icon: "",
    url: "",
    isTitle: true,
    subMenus: [],
    showThisMenuJustAdmin: false
  },
  {
    name: "Stok Karlılık Raporu",
    icon: "fa-solid fa-chart-simple",
    url: "/reports/product-profitability-report",
    isTitle: false,
    subMenus: [],
    showThisMenuJustAdmin: false
  },





]
