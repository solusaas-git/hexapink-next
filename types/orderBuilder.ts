export interface Step {
  id: number;
  name: string;
}

export interface TableColumn {
  tableId: string;
  tableColumn: string;
}

export interface Column {
  id: number;
  name: string;
  type: string;
  stepName?: string;
  showToClient: boolean;
  optional?: boolean;
  isAdditionalFee?: boolean;
  additionalFee?: number;
  tableColumns?: TableColumn[];
}

export interface Collection {
  _id: string;
  title: string;
  image?: string;
  mobileImage?: string;
  type: string;
  countries: string[];
  fee: number;
  status: string;
  featured: boolean;
  columns: Column[];
  createdAt: string;
}

export interface PaymentMethod {
  _id: string;
  paymentType: string;
  bankName?: string;
  accountOwner?: string;
  accountNumber?: string;
  rib?: string;
  iban?: string;
  swift?: string;
  bankLogo?: string;
  status: string;
}

export interface SelectedData {
  [key: string]: {
    value: string[] | { min: string; max: string };
    stepName: string;
    type: string;
  };
}

export interface FilteredDataRow {
  [key: string]: string;
}

