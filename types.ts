export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  note?: string;
}

export interface Budget {
  limit: number;
  alertThreshold: number; // percentage (e.g., 80)
}

export interface UserSettings {
  email: string;
  currency: string;
}

export type ViewState = 'dashboard' | 'add' | 'history' | 'advisor';

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other']
};

export interface ReportBreakdownItem {
  category: string;
  amount: number;
  percentage: string; // e.g., "15%"
}

export interface FinancialReport {
  summary: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  breakdown: ReportBreakdownItem[];
  tips: string[];
  status: 'Under Budget' | 'Near Budget' | 'Over Budget';
}