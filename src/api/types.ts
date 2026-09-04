export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface FiscalPeriod {
  key: string;
  start: string;
  end: string;
  closingDay: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category: Category;
}

export interface ExpenseListResponse {
  period: FiscalPeriod;
  expenses: Expense[];
}

export interface CategoriaResumo {
  categoryId: string;
  nome: string;
  cor: string | null;
  total: number;
  quantidade: number;
  percentual: number;
}

export interface GastosDashboard {
  period: FiscalPeriod;
  resumo: {
    total: number;
    quantidadeLancamentos: number;
    mediaPorLancamento: number;
  };
  porCategoria: CategoriaResumo[];
  lancamentos: Expense[];
}

export interface DebtorSummary {
  id: string;
  name: string;
  notes: string | null;
  totalDevido: number;
  quantidadeDividas: number;
}

export type DebtStatus = "pendente" | "parcial" | "quitado";

export interface Debt {
  id: string;
  amount: number;
  reason: string;
  date: string;
  status: DebtStatus;
  paidAmount: number;
}

export interface DebtorDetail {
  id: string;
  name: string;
  notes: string | null;
  debts: Debt[];
}

export interface ModuleSettingsDto {
  id: string;
  module: "gastos" | "devedores";
  closingDay: number;
}
