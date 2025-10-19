// Financial Models and Enums

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

export enum JournalType {
  Sales = 1,
  Purchase = 2,
  Bank = 3,
  Cash = 4,
  Miscellaneous = 5
}

export enum PartnerType {
  Client = 1,
  Supplier = 2,
  Both = 3
}

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

export enum TrancheStatus {
  Draft = 1,
  Validated = 2,
  Posted = 3,
  Cancelled = 4
}

export enum EntryType {
  Debit = 1,
  Credit = 2,
  Both = 3
}

export enum ReconciliationStatus {
  Pending = 1,
  Reconciled = 2,
  Cancelled = 3
}

// Account Models
export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  parentAccountId?: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountDTO {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  parentAccountId?: number;
}

export interface UpdateAccountDTO {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  parentAccountId?: number;
}

// Journal Models
export interface Journal {
  id: number;
  code: string;
  name: string;
  type: JournalType;
  description?: string;
  isActive: boolean;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalDTO {
  code: string;
  name: string;
  type: JournalType;
  description?: string;
  isActive: boolean;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
}

export interface UpdateJournalDTO {
  code: string;
  name: string;
  type: JournalType;
  description?: string;
  isActive: boolean;
  defaultDebitAccountCode?: string;
  defaultCreditAccountCode?: string;
}

// Partner Models
export interface Partner {
  id: number;
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
  creditLimit: number;
  currentBalance: number;
  totalDebit: number;
  totalCredit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  creditLimit: number;
  isActive: boolean;
}

export interface UpdatePartnerDTO {
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
  creditLimit: number;
  isActive: boolean;
}

// Invoice Models
export interface Invoice {
  id: number;
  invoiceNumber: string;
  partnerId: number;
  partnerName: string;
  journalId: number;
  journalName: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDTO {
  invoiceNumber: string;
  partnerId: number;
  journalId: number;
  invoiceDate: Date;
  dueDate?: Date;
  type: InvoiceType;
  notes?: string;
  reference?: string;
  lines: CreateInvoiceLineDTO[];
}

export interface UpdateInvoiceDTO {
  invoiceNumber: string;
  partnerId: number;
  journalId: number;
  invoiceDate: Date;
  dueDate?: Date;
  type: InvoiceType;
  notes?: string;
  reference?: string;
}

export interface InvoiceLine {
  id: number;
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

export interface CreateInvoiceLineDTO {
  description: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
  unit?: string;
  accountCode?: string;
  notes?: string;
}

// Payment Models
export interface Payment {
  id: number;
  paymentNumber: string;
  partnerId: number;
  partnerName: string;
  journalId: number;
  journalName: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  paymentNumber: string;
  partnerId: number;
  journalId: number;
  paymentDate: Date;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  bankReference?: string;
  checkNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  paymentNumber: string;
  partnerId: number;
  journalId: number;
  paymentDate: Date;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  bankReference?: string;
  checkNumber?: string;
  notes?: string;
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

export interface CreatePaymentTrancheDTO {
  paymentId: number;
  invoiceId: number;
  paymentDate: Date;
  amount: number;
  reference?: string;
  notes?: string;
}

// Journal Entry Models
export interface JournalEntry {
  id: number;
  reference: string;
  journalId: number;
  journalName: string;
  accountId: number;
  accountName: string;
  partnerId?: number;
  partnerName?: string;
  invoiceId?: number;
  paymentId?: number;
  entryDate: Date;
  type: EntryType;
  debit: number;
  credit: number;
  description?: string;
  documentReference?: string;
  isPosted: boolean;
  postedDate?: Date;
  createdBy?: string;
}

// VAT Models
export interface VAT {
  id: number;
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
  isActive: boolean;
  description?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface UpdateVATDTO {
  name: string;
  rate: number;
  accountCode?: string;
  isActive: boolean;
  description?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

// Reconciliation Models
export interface Reconciliation {
  id: number;
  invoiceId: number;
  paymentId: number;
  paymentTrancheId: number;
  reconciliationDate: Date;
  amount: number;
  status: ReconciliationStatus;
  notes?: string;
  postedDate?: Date;
}

// Search and Dashboard Models
export interface FinancialSearchDTO {
  searchTerm?: string;
  accountType?: AccountType;
  journalType?: JournalType;
  partnerType?: PartnerType;
  invoiceType?: InvoiceType;
  invoiceStatus?: InvoiceStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  partnerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  isActive?: boolean;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending: boolean;
}

export interface FinancialDashboardDTO {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  overdueInvoices: number;
  totalAccounts: number;
  totalJournals: number;
  totalPartners: number;
  totalInvoices: number;
  totalPayments: number;
  pendingPayments: number;
  recentTransactions: RecentTransaction[];
  accountBalances: AccountBalance[];
}

export interface RecentTransaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
  accountName: string;
  partnerName?: string;
}

export interface AccountBalance {
  accountId: number;
  accountName: string;
  accountCode: string;
  balance: number;
}