// Financial Module Models and Interfaces

// Base Entity Interface
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Account Types and Models
export enum AccountType {
  Asset = 1,
  Liability = 2,
  Equity = 3,
  Revenue = 4,
  Expense = 5,
  VAT = 6,
  Bank = 7,
  Cash = 8,
  Receivable = 9,
  Payable = 10
}

export interface Account extends BaseEntity {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  parentAccountId?: number;
  parentAccount?: Account;
  childAccounts?: Account[];
  balance: number;
}

export interface CreateAccountDTO {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  parentAccountId?: number;
}

export interface UpdateAccountDTO {
  code?: string;
  name?: string;
  type?: AccountType;
  description?: string;
  parentAccountId?: number;
  isActive?: boolean;
}

// Journal Types and Models
export enum JournalType {
  Sales = 1,
  Purchase = 2,
  Bank = 3,
  Cash = 4,
  Miscellaneous = 5
}

export interface Journal extends BaseEntity {
  code: string;
  name: string;
  type: JournalType;
  description?: string;
  isActive: boolean;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
}

export interface CreateJournalDTO {
  code: string;
  name: string;
  type: JournalType;
  description?: string;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
}

export interface UpdateJournalDTO {
  code?: string;
  name?: string;
  type?: JournalType;
  description?: string;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
  isActive?: boolean;
}

// Partner Types and Models
export enum PartnerType {
  Client = 1,
  Supplier = 2,
  Both = 3
}

export interface Partner extends BaseEntity {
  name: string;
  code?: string;
  type: PartnerType;
  ice?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  creditLimit: number;
  currentBalance: number;
  totalDebit: number;
  totalCredit: number;
  isActive: boolean;
}

export interface CreatePartnerDTO {
  name: string;
  code?: string;
  type: PartnerType;
  ice?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  creditLimit?: number;
}

export interface UpdatePartnerDTO {
  name?: string;
  code?: string;
  type?: PartnerType;
  ice?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  creditLimit?: number;
  isActive?: boolean;
}

// Invoice Types and Models
export enum InvoiceType {
  Sales = 1,
  Purchase = 2,
  CreditNote = 3,
  DebitNote = 4
}

export enum InvoiceStatus {
  Draft = 1,
  Validated = 2,
  Posted = 3,
  Paid = 4,
  Partial = 5,
  Cancelled = 6
}

export interface InvoiceLine {
  id: number;
  invoiceId: number;
  description: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountAmount: number;
  lineTotal: number;
  vatRate: number;
  vatAmount: number;
  lineTotalWithVAT: number;
  unit?: string;
  accountCode?: string;
  notes?: string;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  partnerId: number;
  partner: Partner;
  journalId: number;
  journal: Journal;
  invoiceDate: Date;
  dueDate?: Date;
  type: InvoiceType;
  status: InvoiceStatus;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  reference?: string;
  postedDate?: Date;
  paidDate?: Date;
  lines: InvoiceLine[];
}

export interface CreateInvoiceDTO {
  partnerId: number;
  journalId: number;
  invoiceDate: Date;
  dueDate?: Date;
  type: InvoiceType;
  notes?: string;
  reference?: string;
  lines: CreateInvoiceLineDTO[];
}

export interface CreateInvoiceLineDTO {
  description: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate?: number;
  unit?: string;
  accountCode?: string;
  notes?: string;
}

export interface UpdateInvoiceDTO {
  partnerId?: number;
  journalId?: number;
  invoiceDate?: Date;
  dueDate?: Date;
  type?: InvoiceType;
  notes?: string;
  reference?: string;
}

// Payment Types and Models
export enum PaymentType {
  Incoming = 1,
  Outgoing = 2
}

export enum PaymentStatus {
  Draft = 1,
  Validated = 2,
  Posted = 3,
  Cancelled = 4
}

export enum PaymentMethod {
  Cash = 1,
  BankTransfer = 2,
  Check = 3,
  CreditCard = 4,
  Other = 5
}

export interface PaymentTranche {
  id: number;
  paymentId: number;
  invoiceId: number;
  paymentDate: Date;
  amount: number;
  status: TrancheStatus;
  reference?: string;
  notes?: string;
  postedDate?: Date;
}

export enum TrancheStatus {
  Draft = 1,
  Validated = 2,
  Posted = 3,
  Cancelled = 4
}

export interface Payment extends BaseEntity {
  paymentNumber: string;
  partnerId: number;
  partner: Partner;
  journalId: number;
  journal: Journal;
  paymentDate: Date;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
  bankReference?: string;
  checkNumber?: string;
  notes?: string;
  postedDate?: Date;
  paymentTranches: PaymentTranche[];
}

export interface CreatePaymentDTO {
  partnerId: number;
  journalId: number;
  paymentDate: Date;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  bankReference?: string;
  checkNumber?: string;
  notes?: string;
  paymentTranches?: CreatePaymentTrancheDTO[];
}

export interface CreatePaymentTrancheDTO {
  invoiceId: number;
  paymentDate: Date;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  partnerId?: number;
  journalId?: number;
  paymentDate?: Date;
  type?: PaymentType;
  amount?: number;
  method?: PaymentMethod;
  bankReference?: string;
  checkNumber?: string;
  notes?: string;
}

// VAT Models
export interface VAT extends BaseEntity {
  name: string;
  rate: number;
  accountCode?: string;
  isActive: boolean;
  description?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface CreateVATDTO {
  name: string;
  rate: number;
  accountCode?: string;
  description?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface UpdateVATDTO {
  name?: string;
  rate?: number;
  accountCode?: string;
  description?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

// Search and Dashboard Models
export interface FinancialSearchDTO {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  type?: string;
}

export interface FinancialDashboardDTO {
  totalAccounts: number;
  totalJournals: number;
  totalPartners: number;
  totalInvoices: number;
  totalPayments: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountBalances: AccountBalanceDTO[];
  recentTransactions: RecentTransactionDTO[];
  overdueInvoices: number;
  pendingPayments: number;
}

export interface AccountBalanceDTO {
  accountId: number;
  accountName: string;
  accountCode: string;
  balance: number;
  type: AccountType;
}

export interface RecentTransactionDTO {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: Date;
  reference?: string;
}

// API Response Models
export interface FinancialApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

