export interface User {
  id: string;
  name: string;
  email: string;
  betsEnabled: boolean;
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
  recurringGroupId: string | null;
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
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
}

export interface DebtorDetail {
  id: string;
  name: string;
  notes: string | null;
  totalDevido: number;
  period: FiscalPeriod;
  debts: Debt[];
}

export interface ModuleSettingsDto {
  id: string;
  module: "gastos" | "devedores";
  closingDay: number;
}

export interface Tab {
  id: string;
  name: string;
  color: string | null;
}

export interface TabSummary {
  id: string;
  name: string;
  color: string | null;
  totalGastoPeriodo: number;
  totalPendente: number;
}

export interface PessoaResumo {
  debtorId: string;
  nome: string;
  totalDevido: number;
  totalPago: number;
  dividas: Debt[];
}

export interface DevedoresResumoDto {
  totalEmprestado: number;
  totalRecebido: number;
  totalPendente: number;
  quantidadePessoas: number;
}

export interface VisaoGeralResponse {
  periodKey: string;
  abas: TabSummary[];
  resumoGastos: {
    total: number;
    quantidadeLancamentos: number;
    mediaPorLancamento: number;
  };
  porCategoria: CategoriaResumo[];
  resumoDevedores: DevedoresResumoDto;
  porPessoa: PessoaResumo[];
}

export interface DevedoresDashboard {
  period: FiscalPeriod;
  resumo: DevedoresResumoDto;
  porPessoa: PessoaResumo[];
}

export interface DevedorGeral {
  debtorId: string;
  nome: string;
  totalDevido: number;
  quantidadeDividas: number;
  tabId: string;
  tabName: string;
  tabColor: string | null;
}

export interface BetHouse {
  id: string;
  name: string;
  color: string | null;
  position: number;
  groupId: string | null;
  groupName: string | null;
}

export interface BetHouseGroup {
  id: string;
  name: string;
}

export interface BetOverview {
  totalProfitLoss: number;
  totalProfitLossUnits: number;
}

export interface BetMonthSummary {
  id: string;
  startDate: string;
  endDate: string | null;
  open: boolean;
  startingBanca: number;
  endingBanca: number;
  profitLoss: number;
  profitLossUnits: number;
}

export interface BetMonthDayHouse {
  houseId: string;
  name: string;
  color: string | null;
  balance: number;
  balanceUnits: number;
  result: number;
  resultUnits: number;
  openingOverride: number | null;
  groupId: string | null;
  groupName: string | null;
}

export interface BetMonthDayGroup {
  groupId: string;
  name: string;
  total: number;
  totalUnits: number;
  result: number;
  resultUnits: number;
}

export interface BetMonthDay {
  date: string;
  unitValue: number;
  total: number;
  totalUnits: number;
  result: number;
  resultUnits: number;
  houses: BetMonthDayHouse[];
  groups: BetMonthDayGroup[];
}

export interface BetHouseMonthSummary {
  houseId: string;
  name: string;
  color: string | null;
  totalResult: number;
  totalResultUnits: number;
  groupId: string | null;
  groupName: string | null;
}

export interface BetHouseGroupMonthSummary {
  groupId: string;
  name: string;
  totalResult: number;
  totalResultUnits: number;
}

export interface BetMonthDays {
  monthId: string;
  startDate: string;
  endDate: string | null;
  open: boolean;
  startingBanca: number;
  endingBanca: number;
  profitLoss: number;
  profitLossUnits: number;
  houseSummaries: BetHouseMonthSummary[];
  groupSummaries: BetHouseGroupMonthSummary[];
  days: BetMonthDay[];
}
