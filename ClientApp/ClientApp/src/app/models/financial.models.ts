// Account Models
export interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId?: number;
  parentName?: string;
  level: number;
  isActive: boolean;
  description?: string;
  balance?: number;
}

export interface CreateAccount {
  code: string;
  name: string;
  type: string;
  parentId?: number;
  description?: string;
}

export interface UpdateAccount {
  code: string;
  name: string;
  type: string;
  parentId?: number;
  description?: string;
  isActive: boolean;
}

// Journal Entry Models
export interface JournalEntry {
  id: number;
  date: string;
  reference: string;
  description?: string;
  totalAmount: number;
  status: string;
  createdByUserName?: string;
  postedDate?: string;
  postedByUserName?: string;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: number;
  journalEntryId: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface CreateJournalEntry {
  date: string;
  reference: string;
  description?: string;
  lines: CreateJournalEntryLine[];
}

export interface CreateJournalEntryLine {
  accountId: number;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface UpdateJournalEntry {
  date: string;
  reference: string;
  description?: string;
  lines: CreateJournalEntryLine[];
}

// Bank Account Models
export interface BankAccount {
  id: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
  currency: string;
  balance: number;
  isActive: boolean;
  description?: string;
}

export interface CreateBankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  currency: string;
  description?: string;
}

export interface UpdateBankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  currency: string;
  description?: string;
  isActive: boolean;
}

// Financial Report Models
export interface TrialBalance {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export interface ProfitLoss {
  accountCode: string;
  accountName: string;
  amount: number;
  type: string;
}

export interface BalanceSheet {
  accountCode: string;
  accountName: string;
  balance: number;
  type: string;
}

// Account Types
export const ACCOUNT_TYPES = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' }
];

// Journal Entry Status
export const JOURNAL_ENTRY_STATUS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Posted', label: 'Posted' },
  { value: 'Reversed', label: 'Reversed' }
];

// Currencies
export const CURRENCIES = [
  { value: 'TND', label: 'Tunisian Dinar (TND)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'US Dollar (USD)' }
];
