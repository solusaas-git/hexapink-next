export interface TableItem {
  _id: string;
  userId: string;
  tableName: string;
  leads: number;
  tags: string[];
  columns: [string];
  file: string;
  delimiter: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewUserItem {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | undefined;
  country: string;
}

export interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  industry?: string;
  company?: string;
  role?: string;
  status?: string;
  is_verified?: boolean;
  balance?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RowData {
  [key: string]: string;
}

export interface TagModalProps {
  tableId: string;
  oldTag: string;
  open: boolean;
  actionType: string;
  tables: TableItem[];
  setTables: (updatedTables: TableItem[]) => void;
  handleClose: () => void;
}

export interface Tag {
  name: string;
}

export interface TagOption {
  inputValue?: string;
  name: string;
}

interface mappedTable {
  tableId: string;
  tableName: string;
  tableColumn: string;
}

export interface Column {
  id: number;
  name: string;
  type: string;
  showToClient: boolean;
  isAdditionalFee: boolean;
  additionalFee?: number;
  tableColumns?: mappedTable[];
  optional?: boolean;
  stepName?: string;
}

export interface NewColumn {
  name: string;
  type: string;
  values: string[];
}

export interface Collection {
  _id: string;
  title: string;
  image?: string;
  mobileImage?: string;
  type?: string;
  description?: string;
  featured: boolean;
  countries?: string[];
  fee: number;
  discount?: number;
  columns: Column[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Step {
  id: number;
  name: string;
}

export interface CollectionCreateErrors {
  title: string;
  file: string;
  country: string;
  fee: string;
  columnGenerate: string;
}

export interface PaymentItem {
  _id: string;
  paymentType: string;
  bankName: string;
  accountOwner?: string;
  accountNumber?: string;
  iban?: string;
  rib?: string;
  swift?: string;
  bankLogo?: string;
  qrCode?: string;
  status?: string;
  publicKey?: string;
  secretKey?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  balance: number;
  status: string;
  token: string;
}

export interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

export type UserRole = "admin" | "manager" | "user";

export interface Cart {
  id: string;
  title: string;
  type: string;
  countries: string[];
  collectionId: string;
  image: string;
  unitPrice: number;
  columns: Column[];
  filteredData: RowData[];
  volume: number;
}

export interface File {
  _id?: string;
  title: string;
  type: string;
  countries: string[];
  collectionId: string;
  image: string;
  unitPrice: number;
  volume: number;
  columns: Column;
  status: string;
  path: string;
  orderId: string;
  createdAt?: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  files: File[];
  volume: number;
  prix: number;
  paid: "Paid" | "Unpaid" | "Processing";
  createdAt: string;
}

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface ReviewItem {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  avatar: string;
  job: string;
  featured: boolean;
  content: string;
  rating: number;
  createdAt: string;
}

export interface TransactionItem {
  _id: string;
  userId: string;
  paymentId: string;
  price: number;
  type: string;
  paymentmethod: string;
  status: string;
  receipts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedTransactionItem {
  _id: string;
  userId: UserItem;
  paymentId: PaymentItem;
  price: number;
  type: string;
  paymentmethod: string;
  status: string;
  receipts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  agreeToEmails: boolean;
  createdAt: string;
  message: string;
  read: boolean;
  __v: number;
}

export interface SmtpConfigType {
  host: string;
  port: string;
  userName: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  secure: boolean;
}

export interface FileDataItem {
  id: string;
  data: RowData[]; 
}

